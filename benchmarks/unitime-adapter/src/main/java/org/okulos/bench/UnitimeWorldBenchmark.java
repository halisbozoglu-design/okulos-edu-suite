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
import org.cpsolver.ifs.solution.SolutionComparator;
import org.cpsolver.ifs.solver.Solver;
import org.cpsolver.ifs.util.DataProperties;
import org.cpsolver.ifs.util.ToolBox;

import java.io.BufferedWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

public final class UnitimeWorldBenchmark {
  private static final ObjectMapper M = new ObjectMapper();
  private static final String VERSION = "UniTime/CPSolver@3abbcaaf26d739d25e45c8e191b7ef94bc15cc26";
  private static final int DETERMINISTIC_MAX_ITERS = 100_000;

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

  static final class Meta {
    final String id,teacherId,classId,weekPattern,scopeSig;
    Meta(String id,String teacherId,String classId,String weekPattern,String scopeSig){this.id=id;this.teacherId=teacherId;this.classId=classId;this.weekPattern=weekPattern;this.scopeSig=scopeSig;}
  }
  static final class StudentConflict {
    final String leftId,rightId; final long weight;
    StudentConflict(String leftId,String rightId,long weight){this.leftId=leftId;this.rightId=rightId;this.weight=weight;}
  }
  static final class WorldModel extends TimetableModel {
    final int periods;
    final Map<String,Activity> activities=new LinkedHashMap<>();
    final Map<Activity,Meta> meta=new HashMap<>();
    final List<StudentConflict> conflicts=new ArrayList<>();
    WorldModel(int days,int periods){super(days,periods);this.periods=periods;}
    private Location value(Activity a,Assignment<Activity,Location> asg,boolean best){return best?a.getBestAssignment():asg.getValue(a);}
    long[] objective(Assignment<Activity,Location> asg,boolean best){
      long unplaced=0,medium=0,soft=0;
      Map<String,TreeSet<Integer>> groups=new HashMap<>();
      for(var e:meta.entrySet()){
        Activity a=e.getKey();Meta m=e.getValue();Location x=value(a,asg,best);
        if(x==null){unplaced++;continue;}
        int day=x.getSlot()/periods+1,period=x.getSlot()%periods+1;
        soft+=Math.max(0,period-6)*2L;
        groups.computeIfAbsent("t|"+m.teacherId+"|"+day+"|"+m.scopeSig,k->new TreeSet<>()).add(period);
        groups.computeIfAbsent("c|"+m.classId+"|"+day+"|"+m.scopeSig,k->new TreeSet<>()).add(period);
      }
      for(StudentConflict c:conflicts){Activity aa=activities.get(c.leftId),bb=activities.get(c.rightId);if(aa==null||bb==null)continue;Location a=value(aa,asg,best),b=value(bb,asg,best);if(a!=null&&b!=null&&a.getSlot()==b.getSlot()&&overlap(meta.get(aa).weekPattern,meta.get(bb).weekPattern))medium+=c.weight;}
      for(TreeSet<Integer> ps:groups.values())if(ps.size()>1)soft+=(ps.last()-ps.first()+1-ps.size())*8L;
      return new long[]{unplaced,medium,soft};
    }
  }

  public static final class LexComparator implements SolutionComparator<Activity,Location> {
    public LexComparator(){}
    public LexComparator(DataProperties properties){}
    @Override public boolean isBetterThanBestSolution(Solution<Activity,Location> s){
      if(s.getBestInfo()==null)return true;
      WorldModel m=(WorldModel)s.getModel();long[] cur=m.objective(s.getAssignment(),false),best=m.objective(s.getAssignment(),true);
      for(int i=0;i<cur.length;i++)if(cur[i]!=best[i])return cur[i]<best[i];
      return false;
    }
  }

  static final class Built {
    WorldModel model; Map<String,Activity> activities;
    Built(WorldModel m,Map<String,Activity>a){model=m;activities=a;}
  }

  private static String pattern(JsonNode a){return a.hasNonNull("week_pattern")?a.get("week_pattern").asText():"ALL";}
  private static boolean uses(String pattern,String ctx){return "ALL".equals(pattern)||ctx.equals(pattern);}
  private static boolean overlap(String a,String b){return !("ODD".equals(a)&&"EVEN".equals(b)||"EVEN".equals(a)&&"ODD".equals(b));}
  private static String key(String kind,String id,String ctx){return kind+":"+id+":"+ctx;}
  private static String text(JsonNode a,String k){return a.hasNonNull(k)?a.get(k).asText():"";}
  private static String scopeSig(JsonNode a){return pattern(a)+":"+(a.hasNonNull("term_no")?a.get("term_no").asInt():0)+":"+text(a,"valid_from")+":"+text(a,"valid_to");}

  static Built build(JsonNode c){
    JsonNode p=c.get("problem");
    if(p.path("planningRelations").size()!=0||p.path("locked").size()!=0||p.path("unavailable").size()!=0)throw new IllegalArgumentException("UNSUPPORTED_WORLD_OBJECTIVE_INPUT");
    for(JsonNode a:p.get("assignments"))if(a.path("assigned_hours").asInt()!=1||a.hasNonNull("term_no")||a.hasNonNull("valid_from")||a.hasNonNull("valid_to")||a.hasNonNull("schedule_session_id"))throw new IllegalArgumentException("UNSUPPORTED_WORLD_OBJECTIVE_INPUT");
    int periods=p.get("periods").asInt(),days=p.get("days").size();
    WorldModel model=new WorldModel(days,periods);
    Map<String,Resource> resources=new HashMap<>();
    Map<String,Activity> activities=model.activities;
    Map<String,TeacherLoadConstraint> loads=new HashMap<>();
    Map<String,int[]> limits=new HashMap<>();
    for(JsonNode t:p.get("teacherConstraints"))limits.put(t.get("teacher_id").asText(),new int[]{t.get("max_daily_hours").isNull()?0:t.get("max_daily_hours").asInt(),t.get("max_consecutive_hours").isNull()?0:t.get("max_consecutive_hours").asInt()});
    for(JsonNode a:p.get("assignments")){
      String aid=a.get("assignment_id").asText(),tid=a.get("teacher_id").asText(),cid=a.get("class_id").asText(),wp=pattern(a);
      Activity act=new Activity(1,aid,aid);model.addVariable(act);activities.put(aid,act);model.meta.put(act,new Meta(aid,tid,cid,wp,scopeSig(a)));
      for(String ctx:List.of("ODD","EVEN"))if(uses(wp,ctx)){
        for(String[] r:new String[][]{{"T",tid},{"C",cid}}){String k=key(r[0],r[1],ctx);Resource res=resources.get(k);if(res==null){res=new Resource(k,"T".equals(r[0])?Resource.TYPE_INSTRUCTOR:Resource.TYPE_CLASS,k);model.addConstraint(res);resources.put(k,res);}act.addResourceGroup(res);}
        String lk=key("L",tid,ctx);TeacherLoadConstraint lc=loads.get(lk);if(lc==null){int[] lim=limits.getOrDefault(tid,new int[]{0,0});lc=new TeacherLoadConstraint(periods,lim[0],lim[1]);model.addConstraint(lc);loads.put(lk,lc);}lc.addVariable(act);
      }
      if(a.has("allowed_periods")&&a.get("allowed_periods").isArray()&&a.get("allowed_periods").size()>0){Set<Integer> ok=new HashSet<>();for(JsonNode h:a.get("allowed_periods"))ok.add(h.asInt()-1);for(int d=0;d<days;d++)for(int h=0;h<periods;h++)if(!ok.contains(h))act.addProhibitedSlot(d,h);}
      act.init();
    }
    for(JsonNode x:p.path("studentConflictWeights")){long w=x.path("severity_weight").asLong();if(w<=0)w=x.path("student_weight").asLong();if(w>0)model.conflicts.add(new StudentConflict(x.get("left_assignment_id").asText(),x.get("right_assignment_id").asText(),w));}
    return new Built(model,activities);
  }

  static ObjectNode run(JsonNode c, boolean replay) throws Exception {
    long seed=c.get("seed").asLong(),budget=c.get("wall_clock_budget_ms").asLong();
    ToolBox.setSeed(seed);
    long mem0=used(),t0=System.nanoTime();Built b=build(c);
    DataProperties cfg=new DataProperties();
    cfg.setProperty("General.Seed",Long.toString(seed));
    cfg.setProperty("Termination.Class","org.cpsolver.ifs.termination.GeneralTerminationCondition");
    cfg.setProperty("Termination.StopWhenComplete","false");
    cfg.setProperty("Termination.MaxIters",Integer.toString(DETERMINISTIC_MAX_ITERS));
    cfg.setProperty("Termination.TimeOut","-1");
    cfg.setProperty("Comparator.Class","org.okulos.bench.UnitimeWorldBenchmark$LexComparator");
    cfg.setProperty("Value.Class","org.cpsolver.ifs.heuristics.GeneralValueSelection");
    cfg.setProperty("Value.WeightConflicts","1");
    cfg.setProperty("Variable.Class","org.cpsolver.ifs.heuristics.GeneralVariableSelection");
    Solver<Activity,Location> solver=new Solver<>(cfg);solver.setInitalSolution(b.model);solver.start();
    Thread solverThread=solver.getSolverThread();if(solverThread!=null)solverThread.join();
    Solution<Activity,Location> sol=solver.lastSolution();sol.restoreBest();Assignment<Activity,Location> asg=sol.getAssignment();
    long ms=Math.round((System.nanoTime()-t0)/1_000_000.0);long[] objective=b.model.objective(asg,false);int unplaced=(int)objective[0];ArrayNode rows=M.createArrayNode();
    var signature=new ArrayList<String>();for(var e:b.activities.entrySet()){Location x=asg.getValue(e.getValue());if(x!=null){int day=x.getSlot()/c.get("problem").get("periods").asInt()+1,period=x.getSlot()%c.get("problem").get("periods").asInt()+1;ObjectNode q=M.createObjectNode();q.put("assignment_id",e.getKey());q.put("weekday",day);q.put("period",period);rows.add(q);signature.add(e.getKey()+"@"+day+":"+period);}}
    Collections.sort(signature);boolean deterministic=true;if(replay){ObjectNode second=run(c,false);var s2=new ArrayList<String>();for(JsonNode q:second.withArray("rows"))s2.add(q.get("assignment_id").asText()+"@"+q.get("weekday").asInt()+":"+q.get("period").asInt());Collections.sort(s2);deterministic=signature.equals(s2)&&second.path("medium").asLong()==objective[1]&&second.path("soft").asLong()==objective[2];}
    ObjectNode z=M.createObjectNode();z.put("solver_id","unitime-cpsolver");z.put("solver_version",VERSION);z.put("mapping","WORLD_CANONICAL_LEX_HARD_UNPLACED_MEDIUM_SOFT_DETERMINISTIC_ITERS");z.put("comparable_objective",true);z.put("input_hash",c.get("input_hash").asText());z.put("profile_id",c.get("profile_id").asText());z.put("seed",seed);z.put("status",ms>budget+1500?"TIMEOUT":"COMPLETED");z.put("feasible",unplaced==0);z.put("hard",0);z.put("unplaced",unplaced);z.put("medium",objective[1]);z.put("soft",objective[2]);z.put("runtime_ms",ms);z.put("time_to_first_feasible_ms",unplaced==0?ms:-1);z.put("time_to_best_ms",ms);z.put("peak_memory_mb",Math.max(0,(used()-mem0)/1048576));z.put("deterministic_replay",deterministic);z.put("max_iterations",DETERMINISTIC_MAX_ITERS);z.set("rows",rows);return z;
  }
  static long used(){Runtime r=Runtime.getRuntime();return r.totalMemory()-r.freeMemory();}
  public static void main(String[] args)throws Exception{if(args.length<2)throw new IllegalArgumentException("usage: <cases.ndjson> <out.ndjson>");Set<String> first=new HashSet<>();try(var in=Files.lines(Path.of(args[0]));BufferedWriter out=Files.newBufferedWriter(Path.of(args[1]))){for(var it=in.iterator();it.hasNext();){JsonNode c=M.readTree(it.next());ObjectNode r;try{r=run(c,first.add(c.get("profile_id").asText()));}catch(Exception e){r=M.createObjectNode();r.put("solver_id","unitime-cpsolver");r.put("input_hash",c.get("input_hash").asText());r.put("profile_id",c.get("profile_id").asText());r.put("seed",c.get("seed").asLong());r.put("status","ERROR");r.put("feasible",false);r.put("comparable_objective",false);r.set("diagnostics",M.createObjectNode().put("error",e.toString()));}out.write(M.writeValueAsString(r));out.newLine();out.flush();}}
  }
}
