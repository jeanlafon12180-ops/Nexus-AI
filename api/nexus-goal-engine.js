const VERSION='4.8.0';

const QUALITY_LIMITS=Object.freeze({goal:0.3,context:0.2,verification:0.2,consistency:0.2,completeness:0.1});

export function buildGoal(message,{project=null,intent=null}={}){
 const text=String(message||'').trim();
 const objective=text.slice(0,2000);
 const criteria=[];
 if(intent?.goal)criteria.push('objectif : '+intent.goal);
 if(project?.goal)criteria.push('cohérence avec le projet actif');
 if(/\b(code|site|application|programme|api|développe)\b/i.test(text))criteria.push('cohérence technique');
 if(/\b(compare|analyse|audit|document)\b/i.test(text))criteria.push('couverture des informations utiles');
 if(!criteria.length)criteria.push('réponse directe et complète');
 return{id:'goal-'+Date.now().toString(36),version:VERSION,objective,criteria,expectedOutcome:'Réponse ou livrable aligné sur l’objectif et les contraintes disponibles.',status:'active'};
}

export function evaluateGoal({goal,result='',verification=true,contextComplete=true,consistent=true}={}){
 const text=String(result||'').trim();
 const completeness=text.length>80?1:text.length?0.6:0;
 const scores={goal:text&&goal?.objective?1:0,context:contextComplete?1:0,verification:verification?1:0,consistency:consistent?1:0,completeness};
 const quality=Object.entries(scores).reduce((sum,[key,value])=>sum+value*QUALITY_LIMITS[key],0);
 const status=quality>=0.85?'ready':quality>=0.65?'partial':'needs-adaptation';
 return{version:VERSION,scores,quality:Math.round(quality*100),status,needsAdaptation:status!=='ready',criteria:goal?.criteria||[]};
}

export function buildQualitySignal(evaluation){
 return{ready:Boolean(evaluation?.status==='ready'),quality:Number(evaluation?.quality||0),status:evaluation?.status||'unknown',nextAction:evaluation?.needsAdaptation?'adapt-and-verify':'respond'};
}

export function buildAdaptiveGoalPlan({goal,evaluation}={}){
 return{version:VERSION,objective:goal?.objective||'',strategy:evaluation?.needsAdaptation?'reformulate → improve → verify':'deliver → verify → respond',maxAdaptations:2,stopCondition:'goal-aligned result or bounded adaptation limit'};
}

export function buildProjectRisks(project){
 const risks=[];
 if(!project)return risks;
 if(!(project.goal||'').trim())risks.push({id:'missing-goal',severity:'high',label:'Objectif de projet manquant'});
 if((project.constraints||[]).length>0&&!(project.decisions||[]).length)risks.push({id:'missing-decisions',severity:'medium',label:'Contraintes présentes sans décision enregistrée'});
 const pending=(project.deliverables||[]).filter(x=>x?.status!=='completed');
 if(pending.length>5)risks.push({id:'many-pending',severity:'medium',label:'Nombre élevé de livrables en attente'});
 return risks;
}
