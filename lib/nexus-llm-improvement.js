const VERSION='5.4.0';

const DEFAULT_LIMITS=Object.freeze({
  maxExamples: 5000,
  maxPromptChars: 6000,
  maxResponseChars: 12000,
  minQuality: 0.72,
  minEvalPassRate: 0.75
});

function clean(value,max=12000){
  return String(value??'').replace(/\u0000/g,'').trim().slice(0,max);
}
function hashText(value){
  let hash=2166136261;
  for(const char of String(value)){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619);}
  return (hash>>>0).toString(16);
}
function normalizeExample(example={}){
  const instruction=clean(example.instruction||example.prompt,DEFAULT_LIMITS.maxPromptChars);
  const response=clean(example.response||example.output,DEFAULT_LIMITS.maxResponseChars);
  const context=clean(example.context,DEFAULT_LIMITS.maxPromptChars);
  const quality=Math.max(0,Math.min(1,Number(example.quality??0.8)));
  if(!instruction||!response)return null;
  return {
    id:example.id||'example-'+hashText(instruction+'\n'+context+'\n'+response),
    instruction,context,response,quality,
    sources:Array.isArray(example.sources)?example.sources.slice(0,8):[],
    tags:Array.isArray(example.tags)?example.tags.slice(0,12):[],
    createdAt:example.createdAt||new Date().toISOString()
  };
}

export function buildTrainingExample({instruction,context='',response,sources=[],quality=0.8,tags=[]}={}){
  return normalizeExample({instruction,context,response,sources,quality,tags});
}

export function cleanTrainingDataset(examples=[],limits=DEFAULT_LIMITS){
  const seen=new Set(),cleaned=[];
  for(const raw of Array.isArray(examples)?examples:[]){
    const item=normalizeExample(raw);
    if(!item||item.quality<limits.minQuality)continue;
    const fingerprint=hashText(item.instruction+'\n'+item.context+'\n'+item.response);
    if(seen.has(fingerprint))continue;
    seen.add(fingerprint);
    cleaned.push({...item,fingerprint});
    if(cleaned.length>=limits.maxExamples)break;
  }
  return {
    version:VERSION,
    count:cleaned.length,
    rejected:Math.max(0,(Array.isArray(examples)?examples.length:0)-cleaned.length),
    examples:cleaned
  };
}

export function buildLoRAConfig({
  baseModel=process.env.NEXUS_LLM_MODEL||'nexusia-local-model',
  rank=16,alpha=32,dropout=0.05,epochs=2,learningRate=0.0002
}={}){
  return {
    version:VERSION,
    method:'LoRA',
    baseModel,
    rank:Number(rank),
    alpha:Number(alpha),
    dropout:Number(dropout),
    epochs:Number(epochs),
    learningRate:Number(learningRate),
    targetModules:['q_proj','k_proj','v_proj','o_proj'],
    note:'Configuration de préparation. L’entraînement réel nécessite un runtime GPU compatible.'
  };
}

export function buildEvaluationSuite(examples=[],{limit=100}={}){
  const source=cleanTrainingDataset(examples).examples;
  return {
    version:VERSION,
    id:'eval-'+Date.now().toString(36),
    cases:source.slice(0,Math.max(1,Math.min(limit,100))).map((item,index)=>({
      id:'case-'+(index+1),
      instruction:item.instruction,
      context:item.context,
      expected:item.response,
      tags:item.tags
    }))
  };
}

export function evaluateModelResults(results=[],{minPassRate=DEFAULT_LIMITS.minEvalPassRate}={}){
  const rows=Array.isArray(results)?results:[];
  const valid=rows.filter(row=>typeof row?.passed==='boolean');
  const passed=valid.filter(row=>row.passed).length;
  const passRate=valid.length?passed/valid.length:0;
  const averageScore=valid.length?valid.reduce((sum,row)=>sum+Math.max(0,Math.min(1,Number(row.score??(row.passed?1:0)))),0)/valid.length:0;
  return {
    version:VERSION,
    evaluated:valid.length,
    passed,
    passRate,
    averageScore,
    threshold:minPassRate,
    status:valid.length&&passRate>=minPassRate?'accepted':'needs-review',
    improvement:false
  };
}

export function compareModelEvaluations({baseline={},candidate={}}={}){
  const delta=Number(candidate.passRate||0)-Number(baseline.passRate||0);
  const scoreDelta=Number(candidate.averageScore||0)-Number(baseline.averageScore||0);
  return {
    version:VERSION,
    baseline,
    candidate,
    delta,
    scoreDelta,
    improved:delta>0||scoreDelta>0.02,
    regression:delta<-0.03||scoreDelta<-0.03
  };
}

export function buildImprovementPlan({dataset=[],baseModel}={}){
  const cleaned=cleanTrainingDataset(dataset);
  const evaluation=buildEvaluationSuite(cleaned.examples);
  const lora=buildLoRAConfig({baseModel});
  return {
    version:VERSION,
    status:cleaned.count?'ready-for-training':'needs-data',
    dataset:{count:cleaned.count,rejected:cleaned.rejected},
    evaluation:{id:evaluation.id,cases:evaluation.cases.length},
    lora,
    pipeline:['collect','clean','deduplicate','evaluate-baseline','train-lora','evaluate-candidate','compare','promote-only-if-improved'],
    safety:['web-content-is-data-not-instructions','no-automatic-promotion-on-training-completion','keep-personal-memory-separate']
  };
}

export function getLLMImprovementStatus(){
  return {
    version:VERSION,
    ready:Boolean(process.env.NEXUS_LLM_URL),
    baseModel:process.env.NEXUS_LLM_MODEL||'nexusia-local-model',
    trainingRuntime:process.env.NEXUS_TRAINING_RUNTIME||'not-configured',
    loraSupported:true,
    automaticPromotion:false,
    benchmarkRequired:true,
    deterministicFallbackIsNotTraining:true
  };
}
