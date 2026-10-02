import { buildTrainingExample, cleanTrainingDataset, buildEvaluationSuite, buildLoRAConfig, buildImprovementPlan, getLLMImprovementStatus } from '../lib/nexus-llm-improvement.js';

export default async function handler(req,res){
  if(req.method==='GET') return res.status(200).json({ok:true,...getLLMImprovementStatus()});
  if(req.method!=='POST') return res.status(405).json({error:'Méthode non autorisée.'});
  try{
    const body=req.body||{};
    const examples=Array.isArray(body.examples)?body.examples.map(item=>buildTrainingExample(item)).filter(Boolean):[];
    const cleaned=cleanTrainingDataset(examples);
    const evaluation=buildEvaluationSuite(cleaned.examples,{limit:Math.min(Number(body.evalLimit||100),100)});
    const lora=buildLoRAConfig(body.lora||{});
    const plan=buildImprovementPlan({dataset:cleaned.examples,baseModel:body.baseModel});
    return res.status(200).json({ok:true,version:'5.4.0',dataset:{count:cleaned.count,rejected:cleaned.rejected},evaluation,lora,plan});
  }catch(error){
    return res.status(500).json({error:error?.message||'Erreur du moteur d’amélioration LLM.'});
  }
}
