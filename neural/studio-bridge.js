/* Animation Studio experimental local neural synthesis, VocoLoco worker bridge.
 * Source worker: https://github.com/Magkino/vocoloco_tts (Apache-2.0).
 * OmniVoice model weights: CC BY-NC; noncommercial use only.
 */
(()=>{'use strict';
const $=id=>document.getElementById(id);
let worker=null,ready=false,job=null;
const status=message=>{const el=$('neuralGenerateStatus');if(el)el.textContent=message};
function wavBlob(pcm,sampleRate){const n=pcm.length,b=new ArrayBuffer(44+n*2),v=new DataView(b);const str=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};str(0,'RIFF');v.setUint32(4,36+n*2,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sampleRate,true);v.setUint32(28,sampleRate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,n*2,true);for(let i=0;i<n;i++){const x=Math.max(-1,Math.min(1,pcm[i]));v.setInt16(44+i*2,x<0?x*32768:x*32767,true)}return new Blob([b],{type:'audio/wav'})}
function fail(msg){status('Ошибка: '+msg);$('neuralGenerate').disabled=false;$('neuralInit').disabled=false;job=null}
function stop(){if(worker)worker.terminate();worker=null;ready=false;job=null;$('neuralInit').disabled=false;$('neuralGenerate').disabled=true;status('Движок остановлен')}
$('neuralStop').onclick=stop;
$('neuralInit').onclick=()=>{
 if(worker)stop();
 if(!navigator.gpu){fail('Для нейросети требуется WebGPU');return}
 if(!confirm('Для работы нейросети потребуется загрузить примерно 1,2 ГБ или больше и сохранить данные на устройстве. Продолжить?'))return;
 $('neuralInit').disabled=true;status('Запускаю локальный нейродвижок...');
 try{worker=new Worker('./neural/workers/tts-worker.js',{type:'module'})}catch(e){fail(e.message);return}
 worker.onerror=e=>{fail('Не удалось загрузить модуль: '+(e.message||'ошибка Worker'));stop()};
 worker.onmessage=async({data:m})=>{
  if(m.type==='plan'){const mb=m.totalBytes?Math.round(m.totalBytes/1048576):null;const yes=confirm('Нужно скачать '+(mb?mb+' МБ':'файлы модели')+'. Продолжить?');if(yes)worker.postMessage({type:'start-download'});else stop()}
  else if(m.type==='memory-check'){if(m.state==='start'){status('Проверяю доступную память GPU...');worker.postMessage({type:'memory-check-go'})}else if(!m.ok)fail('Недостаточно памяти GPU')}
  else if(m.type==='progress'){status((m.detail||m.phase||'Загрузка модели')+(m.totalBytes?' ('+Math.round(100*m.loadedBytes/m.totalBytes)+'%)':''))}
  else if(m.type==='ready'){ready=true;$('neuralGenerate').disabled=false;$('neuralInit').disabled=false;status('✓ Нейросеть готова ('+m.backend+'). Введи реплику и нажми «Сгенерировать».')}
  else if(m.type==='audio'){if(!job||m.jobId!==job.id)return;try{const blob=wavBlob(m.pcm,m.sampleRate||24000);await saveSceneClip(job.scene,blob);const old=sceneAudioUrls.get(job.scene);if(old)URL.revokeObjectURL(old);sceneAudioUrls.set(job.scene,URL.createObjectURL(blob));updateAudioStatus();status('✓ Настоящая нейроречь сгенерирована и сохранена для сцены '+(job.scene+1));if(current===job.scene)playSceneAudio()}catch(e){fail('Ошибка сохранения: '+e.message)}finally{job=null;$('neuralGenerate').disabled=false}}
  else if(m.type==='error'){fail(m.message||m.code||'ошибка генерации')}
  else if(m.type==='cancelled'){status('Генерация отменена');job=null;$('neuralGenerate').disabled=false}
 };
 // Do not probe hundreds of megabytes in addition to the model on memory-limited iPhones.
 worker.postMessage({type:'init',modelBaseUrl:'https://huggingface.co/Gigsu/vocoloco-onnx/resolve/main',forceCPU:false,confirmDownload:true,lowMemory:true,probeBytes:0});
};
$('neuralGenerate').onclick=()=>{if(!ready||!worker){status('Сначала загрузи нейросеть');return}if(job){status('Подожди окончания текущей генерации');return}const text=(scenes[current]?.text||'').trim();if(!text){status('Нет текста для озвучки');return}if(text.length>300){status('Для первой проверки используй реплику до 300 символов');return}const selected=voiceLibrary.find(v=>v.id===voiceAssignments[current]);const preset=selected||{pitch:Number($('voicePitch').value),speed:Number($('voiceCharacterSpeed').value),texture:$('voiceTexture').value};const id='scene-'+current+'-'+Date.now();job={id,scene:current};$('neuralGenerate').disabled=true;status('Генерирую русскую речь...');worker.postMessage({type:'synthesize',jobId:id,text,lang:null,numStep:8,guidanceScale:2,tShift:.1,speed:1,tempo:Math.max(.75,Math.min(1.25,100/(Number(preset.speed)||100))),seed:null,instruct:null,normalize:false,leadMs:200,trailMs:400,returnTokens:false})};
})();