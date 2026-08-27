package org.okulos.bench;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.cpsolver.ifs.assignment.Assignment;
import org.cpsolver.ifs.example.tt.Activity;
import org.cpsolver.ifs.example.tt.Location;
import org.cpsolver.ifs.example.tt.Resource;
import org.cpsolver.ifs.example.tt.TimetableModel;
import org.cpsolver.ifs.model.Constraint;
import org.cpsolver.ifs.solution.Solution;
import org.cpsolver.ifs.solver.Solver;
import org.cpsolver.ifs.util.DataProperties;

import java.io.BufferedWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

public final class UnitimeWorldBenchmark {
  private static final ObjectMapper M = new ObjectMapper();
  private static final String VERSION = "UniTime/CPSolver@3abbcaaf26d739d25e45c8e191b7ef94bc15cc26";

  static final class TeacherLoadConstraint extends Constraint<Activity, Location> {
    final int periods, maxDaily, maxConsecutive;
    TeacherLoadConstraint(int periods, int maxDaily, int maxConsecutive) {
      this.periods=periods; this.maxDaily=maxDaily; this.maxConsecutive=maxConsecutive;
    }
    private int day(Location x){ return x.getSlot()/periods; }
    private int hour(Location x){ return x.getSlot()%periods; }
    private boolean violates(List<Location> xs) {
      Map<Integer,List<Integer>> byDay=new HashMap<>();
      for(Location x:xs) byDay.computeIfAbsent(day(x),k->new ArrayList<>()).add(hour(x));
      for(List<Integer> hs:byDay.values()) {
        if(maxDaily>0 && hs.size()>maxDaily) return true;
        if(maxConsecutive>0) {
          var set=new HashSet<>(hs); int run=0,best=0;
          for(int h=0;h<periods;h++){run=set.contains(h)?run+1:0;best=Math.max(best,run);}
          if(best>maxConsecutive)return true;
        }
      }
      return false;
    }
    @Override public void computeConflicts(Assignment<Activity,Location> assignment, Location value, Set<Location> conflicts) {
      var active=new ArrayList<Location>(); active.add(value);
      for(Activity a:variables()) {
        if(a.equals(value.variable()))continue;
        Location x=assignment.getValue(a);
        if(x!=null && !conflicts.contains(x))active.add(x);
      }
      if(!violates(active))return;
      var sameDay=new ArrayList<Location>();
      for(int i=1;i<active.size();i++)if(day(active.get(i))==day(value))sameDay.add(active.get(i));
      sameDay.sort(Comparator.comparingInt(this::hour).reversed());
      for(Location x:sameDay){conflicts.add(x);active.remove(x);if(!violates(active))break;}
    }
  }

  static final class Built {
    TimetableModel model; Map<String,Activity> activities;
    Built(TimetableModel m,Map<String,Activity>a){model=m;activities=a;}
  }

  private static String pattern(JsonNode a){return a.hasNonNull("week_pattern")?a.get("week_pattern").asText():"ALL";}
  private static boolean uses(String pattern,String ctx){return "ALL".equals(pattern)||ctx.equals(pattern);}
  private static String key(String kind,String id,String ctx){return kind+":"+id+":"+ctx;}

  static Built build(JsonNode c){
    JsonNode p=c.get("problem"); int periods=p.get("periods").asInt(),days=p.get("days").size();
    TimetableModel model=new TimetableModel(days,periods);
    Map<String,Resource> resources=new HashMap<>();
    Map<String,Activity> activities=new LinkedHashMap<>();
    Map<String,TeacherLoadConstraint> loads=new HashMap<>();
    Map<String,int[]> limits=new HashMap<>();
    for(JsonNode t:p.get("teacherConstraints"))limits.put(t.get("teacher_id").asText(),new int[]{t.get("max_daily_hours").isNull()?0:t.get("max_daily_hours").asInt(),t.get("max_consecutive_hours").isNull()?0:t.get("max_consecutive_hours").asInt()});
    for(JsonNode a:p.get("assignments")){
      String aid=a.get("assignment_id").asText(),tid=a.get("teacher_id").asText(),cid=a.get("class_id").asText(),wp=pattern(a);
      Activity act=new Activity(1,aid,aid);model.addVariable(act);activities.put(aid,act);
      for(String ctx:List.of("ODD","EVEN"))if(uses(wp,ctx)){
        for(String[] r:new String[][]{{"T",tid},{"C",cid}}){String k=key(r[0],r[1],ctx);Resource res=resources.get(k);if(res==null){res=new Resource(k,"T".equals(r[0])?Resource.TYPE_INSTRUCTOR:Resource.TYPE_CLASS,k);model.addConstraint(res);resources.put(k,res);}act.addResourceGroup(res);}
        String lk=key("L",tid,ctx);TeacherLoadConstraint lc=loads.get(lk);if(lc==null){int[] lim=limits.getOrDefault(tid,new int[]{0,0});lc=new TeacherLoadConstraint(periods,lim[0],lim[1]);model.addConstraint(lc);loads.put(lk,lc);}lc.addVariable(act);
      }
      if(a.has("allowed_periods")&&a.get("allowed_periods").isArray()&&a.get("allowed_periods").size()>0){Set<Integer> ok=new HashSet<>();for(JsonNode h:a.get("allowed_periods"))ok.add(h.asInt()-1);for(int d=0;d<days;d++)for(int h=0;h<periods;h++)if(!ok.contains(h))act.addProhibitedSlot(d,h);}
      act.init();
    }
    return new Built(model,activities);
  }

  static ObjectNode run(JsonNode c, boolean replay) throws Exception {
    long seed=c.get("seed").asLong(),budget=c.get("wall_clock_budget_ms").asLong();
    long mem0=used(),t0=System.nanoTime();Built b=build(c);
    DataProperties cfg=new DataProperties();
    cfg.setProperty("General.Seed",Long.toString(seed));
    cfg.setProperty("Termination.Class","org.cpsolver.ifs.termination.GeneralTerminationCondition");
    cfg.setProperty("Termination.StopWhenComplete","true");
    cfg.setProperty("Termination.TimeOut",Double.toString(budget/1000.0));
    cfg.setProperty("Comparator.Class","org.cpsolver.ifs.solution.GeneralSolutionComparator");
    cfg.setProperty("Value.Class","org.cpsolver.ifs.heuristics.GeneralValueSelection");
    cfg.setProperty("Value.WeightConflicts","1");
    cfg.setProperty("Variable.Class","org.cpsolver.ifs.heuristics.GeneralVariableSelection");
    Solver<Activity,Location> solver=new Solver<>(cfg);solver.setInitalSolution(b.model);solver.start();solver.getSolverThread().join();
    Solution<Activity,Location> sol=solver.lastSolution();sol.restoreBest();Assignment<Activity,Location> asg=sol.getAssignment();
    long ms=Math.round((System.nanoTime()-t0)/1_000_000.0);int unplaced=asg.nrUnassignedVariables(b.model);ArrayNode rows=M.createArrayNode();
    var signature=new ArrayList<String>();for(var e:b.activities.entrySet()){Location x=asg.getValue(e.getValue());if(x!=null){int day=x.getSlot()/c.get("problem").get("periods").asInt()+1,period=x.getSlot()%c.get("problem").get("periods").asInt()+1;ObjectNode q=M.createObjectNode();q.put("assignment_id",e.getKey());q.put("weekday",day);q.put("period",period);rows.add(q);signature.add(e.getKey()+"@"+day+":"+period);}}
    Collections.sort(signature);boolean deterministic=true;if(replay){ObjectNode second=run(c,false);var s2=new ArrayList<String>();for(JsonNode q:second.withArray("rows"))s2.add(q.get("assignment_id").asText()+"@"+q.get("weekday").asInt()+":"+q.get("period").asInt());Collections.sort(s2);deterministic=signature.equals(s2);}
    ObjectNode z=M.createObjectNode();z.put("solver_id","unitime-cpsolver");z.put("solver_version",VERSION);z.put("mapping","HARD_COMMON_CORE_IFS");z.put("comparable_objective",false);z.put("input_hash",c.get("input_hash").asText());z.put("profile_id",c.get("profile_id").asText());z.put("seed",seed);z.put("status",ms>budget+1500?"TIMEOUT":"COMPLETED");z.put("feasible",unplaced==0);z.put("hard",0);z.put("unplaced",unplaced);z.put("runtime_ms",ms);z.put("time_to_first_feasible_ms",unplaced==0?ms:-1);z.put("time_to_best_ms",ms);z.put("peak_memory_mb",Math.max(0,(used()-mem0)/1048576));z.put("deterministic_replay",deterministic);z.set("rows",rows);return z;
  }
  static long used(){Runtime r=Runtime.getRuntime();return r.totalMemory()-r.freeMemory();}
  public static void main(String[] args)throws Exception{if(args.length<2)throw new IllegalArgumentException("usage: <cases.ndjson> <out.ndjson>");Set<String> first=new HashSet<>();try(var in=Files.lines(Path.of(args[0]));BufferedWriter out=Files.newBufferedWriter(Path.of(args[1]))){for(var it=in.iterator();it.hasNext();){JsonNode c=M.readTree(it.next());ObjectNode r;try{r=run(c,first.add(c.get("profile_id").asText()));}catch(Exception e){r=M.createObjectNode();r.put("solver_id","unitime-cpsolver");r.put("input_hash",c.get("input_hash").asText());r.put("profile_id",c.get("profile_id").asText());r.put("seed",c.get("seed").asLong());r.put("status","ERROR");r.put("feasible",false);r.set("diagnostics",M.createObjectNode().put("error",e.toString()));}out.write(M.writeValueAsString(r));out.newLine();out.flush();}}
  }
}
