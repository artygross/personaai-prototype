const screens=[...document.querySelectorAll('.screen')];
const stepButtons=[...document.querySelectorAll('.progress-step')];
const stepNumber=document.querySelector('#stepNumber');
const input=document.querySelector('#photoInput');
const uploadBg=document.querySelector('.upload-bg');
const uploadLabel=document.querySelector('#uploadLabel');
const fileHint=document.querySelector('#fileHint');
const styleNames={anime:'Аниме',cyberpunk:'Киберпанк',clay:'3D-персонаж',pixel:'Пиксель-арт',pop:'Поп-арт',photo:'Фотопортрет'};
let currentStep=1,selectedStyle='anime',progressTimer,selectedResult='assets/result-1.jpg';

function setStep(next){
  const n=Math.max(1,Math.min(4,Number(next)));
  clearInterval(progressTimer);
  screens.forEach(s=>s.classList.toggle('is-active',Number(s.dataset.screen)===n));
  stepButtons.forEach((button,index)=>{
    button.classList.toggle('is-active',index+1===n);
    button.classList.toggle('is-complete',index+1<n);
    button.querySelector('i').textContent=String(index+1);
  });
  stepNumber.textContent=String(n);currentStep=n;
  if(n===3)startGeneration();
}

document.querySelectorAll('[data-go]').forEach(button=>button.addEventListener('click',()=>setStep(button.dataset.go)));
document.querySelector('#generateButton').addEventListener('click',()=>setStep(3));
stepButtons.forEach(button=>button.addEventListener('click',()=>{const target=Number(button.dataset.step);if(target<currentStep)setStep(target)}));

input.addEventListener('change',()=>{
  const file=input.files?.[0];if(!file)return;
  if(file.size>10*1024*1024){showToast('Файл больше 10 МБ');input.value='';return}
  const url=URL.createObjectURL(file);
  uploadBg.style.backgroundImage=`url("${url}")`;
  uploadBg.style.backgroundPosition='68% center';
  uploadLabel.textContent='Фото выбрано';fileHint.textContent=file.name;
  setTimeout(()=>setStep(2),650);
});

document.querySelectorAll('.style-option').forEach(option=>option.addEventListener('click',()=>{
  selectedStyle=option.dataset.style;
  document.querySelectorAll('.style-option').forEach(el=>{const active=el===option;el.classList.toggle('is-selected',active);el.setAttribute('aria-checked',String(active))});
  document.querySelectorAll('.style-bg').forEach(bg=>bg.classList.toggle('is-active',bg.dataset.styleBg===selectedStyle));
  document.querySelector('#generationStyle').textContent=styleNames[selectedStyle];
}));

function startGeneration(){
  const fill=document.querySelector('#progressFill'),value=document.querySelector('#progressValue'),time=document.querySelector('#timeLeft');
  let progress=0;fill.style.width='0%';value.textContent='0%';time.textContent='Осталось около 20 секунд';
  progressTimer=setInterval(()=>{
    progress=Math.min(100,progress+Math.max(1,Math.round((100-progress)/9)));
    fill.style.width=`${progress}%`;value.textContent=`${progress}%`;
    const seconds=Math.max(0,Math.ceil((100-progress)/5));time.textContent=seconds?`Осталось около ${seconds} секунд`:'Готово';
    if(progress>=100){clearInterval(progressTimer);setTimeout(()=>setStep(4),650)}
  },250);
}

document.querySelectorAll('.result-thumb').forEach(thumb=>thumb.addEventListener('click',()=>{
  selectedResult=thumb.dataset.result;
  document.querySelectorAll('.result-thumb').forEach(el=>{const active=el===thumb;el.classList.toggle('is-selected',active);el.setAttribute('aria-checked',String(active))});
  const figure=document.querySelector('.result-main'),main=document.querySelector('#mainResult');figure.classList.add('is-changing');
  setTimeout(()=>{main.src=selectedResult;document.querySelector('#downloadButton').href=selectedResult;figure.classList.remove('is-changing')},180);
}));

document.querySelector('#shareButton').addEventListener('click',async()=>{
  if(navigator.share){try{await navigator.share({title:'Мой аватар PersonaAI',text:'Посмотрите мой новый AI-аватар'});return}catch(error){if(error.name==='AbortError')return}}
  try{await navigator.clipboard.writeText(location.href);showToast('Ссылка скопирована')}catch{showToast('Ссылка готова к отправке')}
});

let toastTimer;function showToast(message){const toast=document.querySelector('#toast');toast.textContent=message;toast.classList.add('is-visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('is-visible'),2200)}
