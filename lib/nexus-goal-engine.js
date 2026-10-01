const VERSION='5.3.0';

const QUALITY_LIMITS=Object.freeze({goal:0.28,context:0.18,verification:0.2,consistency:0.18,completeness:0.1,evidence:0.06});

function clean(value,max=4000){return String(value||'').replace(/\u0000/g,'').trim().slice(0,max);}
function detectCriteria(text){
 const criteria=[];
 if(/\b(code|site|application|programme|api|développe|architecture|système)\b/i.test(text))criteria.push({id:'technical',label:'cohérence technique',weight:0.18});
 if(/\b(compare|analyse|audit|document|rapport|preuve|source)\b/i.test(text))criteria.push({id:'evidence',label:'couverture et traçabilité des informations utiles',weight:0.16});
 if(/\b(plan|étapes|workflow|mission|déploiement|migration)\b/i.test(text))criteria.push({id:'execution',label:'plan exécutable et dépendances cohérentes',weight:0.16});
 if(/\b(image|vidéo|musique|audio|design|logo)\b/i.test(text))criteria.push({id:'modality',label:'respect de la modalité demandée',weight:0.12});
 if(/\b(exactement|obligatoire|sans|avec|budget|limite|maximum|minimum)\b/i.test(text))criteria.push({id:'constraints',label:'respect des contraintes explicites',weight:0.18});
 return criteria;
}

export function buildGoal(message,{project=null,intent=null}={}){
 const text=clean(message,4000);
 const objective=text.slice(0,2000);
 const criteria=[...(intent?.goal?[{id:'intent',label:'objectif : '+intent.goal,weight:0.18}]:[])];
 if(project?.goal)criteria.push({id:'project',label:'cohérence avec le projet actif',weight:0.16});
 criteria.push(...detectCriteria(text));
 if(!criteria.length)criteria.push({id:'direct',label:'réponse directe et complète',weight:0.3});
 const total=criteria.reduce((s,x)=>s+x.weight,0)||1;
 const normalized=criteria.map(x=>({...x,weight:Number((x.weight/total).toFixed(4))}));
 return{id:'goal-'+Date.now().toString(36),version:VERSION,objective,criteria:normalized,expectedOutcome:'Réponse ou livrable aligné sur l’objectif, les contraintes, le contexte et les preuves disponibles.',status:'active'};
}

export function evaluateGoal({goal,result='',verification=true,contextComplete=true,consistent=true,evidenceAvailable=true}={}){
 const text=clean(result,16000);
 const completeness=text.length>240?1:text.length>80?.8:text.length?.55:0;
 const objective=clean(goal?.objective,2000);
 const goalMatch=text&&objective?Math.min(1,Math.max(0.35,text.length>120?.9:.65)):0;
 const evidence=evidenceAvailable?1:0.7;
 const scores={goal:goalMatch,context:contextComplete?1:.55,verification:verification?1:.35,consistency:consistent?1:.5,completeness,evidence};
 const quality=Object.entries(scores).reduce((sum,[key,value])=>sum+value*(QUALITY_LIMITS[key]||0),0);
 const status=quality>=.86?'ready':quality>=.68?'partial':'needs-adaptation';
 const weaknesses=Object.entries(scores).filter(([,v])=>v<.7).map(([k])=>k);
 return{version:VERSION,scores,quality:Math.round(quality*100),status,needsAdaptation:status!=='ready',weaknesses,criteria:goal?.criteria||[]};
}

export function buildQualitySignal(evaluation){
 return{ready:Boolean(evaluation?.status==='ready'),quality:Number(evaluation?.quality||0),status:evaluation?.status||'unknown',weaknesses:evaluation?.weaknesses||[],nextAction:evaluation?.needsAdaptation?'adapt-and-verify':'respond'};
}

export function buildAdaptiveGoalPlan({goal,evaluation}={}){
 const weak=(evaluation?.weaknesses||[]).join(', ')||'none';
 return{version:VERSION,objective:goal?.objective||'',strategy:evaluation?.needsAdaptation?'diagnose ['+weak+'] → improve → verify':'deliver → verify → respond',maxAdaptations:2,stopCondition:'goal-aligned result or bounded adaptation limit'};
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


export function buildGoalDriftSignal({goal=null,result='',contextComplete=true}={}){
 const objective=clean(goal?.objective,2000).toLowerCase(), output=clean(result,16000).toLowerCase();
 const objectiveTokens=new Set(objective.split(/\s+/).filter(x=>x.length>3));
 const matched=[...objectiveTokens].filter(token=>output.includes(token)).length;
 const coverage=objectiveTokens.size?matched/objectiveTokens.size:1;
 const drift=objectiveTokens.size?1-coverage:0;
 return {version:VERSION,objectiveCoverage:Math.round(coverage*100),drift:Math.round(drift*100),contextComplete:Boolean(contextComplete),needsAdaptation:drift>=0.55||!contextComplete};
}

export function buildQualityTrajectory(previous=null,current=null){
 const before=Number(previous?.quality||0),after=Number(current?.quality||0);
 return {version:VERSION,before,after,delta:after-before,direction:after>before?'improving':after<before?'regressing':'stable',needsAnotherPass:after<86};
}

export function buildGoalCoverage({goal=null,result='',verification=null}={}){
 const objective=clean(goal?.objective,4000).toLowerCase();
 const output=clean(result,16000).toLowerCase();
 const terms=[...new Set(objective.split(/\s+/).filter(t=>t.length>4))];
 const matched=terms.filter(t=>output.includes(t)).length;
 const coverage=terms.length?matched/terms.length:1;
 const verified=Boolean(verification?.performed||verification===true);
 return {version:VERSION,coverage:Math.round(coverage*100),verified,ready:coverage>=0.55&&verified,missing:terms.filter(t=>!output.includes(t)).slice(0,12)};
}
