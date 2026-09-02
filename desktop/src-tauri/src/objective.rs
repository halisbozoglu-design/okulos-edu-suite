use std::cmp::Ordering;

#[derive(Debug, Clone, Copy)]
pub struct ObjectiveVector { pub hard:f64, pub unplaced:f64, pub medium:f64, pub soft:f64 }

pub fn compare_objective_vectors(left:ObjectiveVector,right:ObjectiveVector)->Result<Ordering,&'static str>{
 let l=[left.hard,left.unplaced,left.medium,left.soft];let r=[right.hard,right.unplaced,right.medium,right.soft];
 if l.into_iter().chain(r).any(|v|!v.is_finite()||v<0.0){return Err("SCHEDULE_OBJECTIVE_VECTOR_INVALID")}
 for(a,b)in l.into_iter().zip(r){if a<b{return Ok(Ordering::Less)}if a>b{return Ok(Ordering::Greater)}}Ok(Ordering::Equal)
}

#[cfg(test)]mod tests{use super::*;fn fixture()->Vec<(ObjectiveVector,usize)>{include_str!("../../../benchmarks/schedule-score-parity/objective-vectors.tsv").lines().skip(1).map(|line|{let p:Vec<&str>=line.split('\t').collect();(ObjectiveVector{hard:p[1].parse().unwrap(),unplaced:p[2].parse().unwrap(),medium:p[3].parse().unwrap(),soft:p[4].parse().unwrap()},p[5].parse().unwrap())}).collect()}
 #[test]fn shared_fixture_has_canonical_native_order(){let mut rows=fixture();rows.sort_by(|a,b|compare_objective_vectors(a.0,b.0).unwrap());assert_eq!(rows.iter().map(|x|x.1).collect::<Vec<_>>(),vec![1,2,3,4,5,6])}
 #[test]fn invalid_values_fail_closed(){let bad=ObjectiveVector{hard:f64::NAN,unplaced:0.0,medium:0.0,soft:0.0};assert!(compare_objective_vectors(bad,bad).is_err())}}
