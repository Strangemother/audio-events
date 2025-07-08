function monitorAudioTime(audioElement, callback) {
    if (!audioElement || typeof callback !== 'function') {
        console.error('Invalid arguments');
        return;
    }

    const intervalId = setInterval(() => {
        if(audioElement.paused || audioElement.ended) return;
        callback(audioElement.currentTime);
    }, 1000);

    return () => clearInterval(intervalId); // returns a cleanup function
}


const audio = document.querySelector('audio');

const slot2 = function(audio, currentTime){
    console.log('slot: 2', currentTime)
}

const slot3 = function(audio, currentTime){
    console.log('slot: 3', currentTime)
}

const slot5 = function(audio, currentTime){
    console.log('slot: 5', currentTime)
}
const slot7 = function(audio, currentTime){
    console.log('slot: 7', currentTime)
}

const slotEnd = function(audio, currentTime){
    console.log('finished', currentTime)
}

const timeSlots = {
    2: {slot: slot2, visited: false, eventTime: 2}
    , 3: {slot: slot3, visited: false, eventTime: 3}
    , 5: {slot: slot5, visited: false, eventTime: 5}
    , 7: {slot: slot7, visited: false, eventTime: 7}
    , end: {slot: slotEnd, visited: false, eventTime: -1}
}

const resetVisits = (slots) => {
    Object.values(slots).forEach(s => (s.visited = false));
};


function createSlotTracker(slots) {
  let lastTime = 0;


  return function check(timeNow) {
    // If user jumped backwards, wipe history
    if (timeNow < lastTime) resetVisits(timeSlots);
    lastTime = timeNow;

    const whole = Math.floor(timeNow);             // integer seconds
    const active = slots[whole];

    if (active && !active.visited) {
      const distance = active.eventTime - timeNow; // always < 1 s here
      active.visited = true;

      setTimeout(() => active.slot(audio, audio.currentTime), distance * 1000);
    }
  };
}



const slotTracker = createSlotTracker(timeSlots);

audio.addEventListener('timeupdate', () => {
  if (!audio.paused && !audio.ended) {
    slotTracker(audio.currentTime);
  }
});

audio.addEventListener('ended', () => {
    console.log('Playback finished.');
    // Reset slots, show end screen, enable replay, summon goats, etc.
    timeSlots.end.slot(audio, audio.currentTime)
});


const stopMonitoring = monitorAudioTime(audio, (currentTime) => {
    let t = currentTime.toFixed(0)
    // console.log(`Current time: ${t}s`);
    // You can trigger stuff here
    /* Run to the cell nearest this time.*/
    const keys = Object.keys(timeSlots)
    var activeSlot = undefined

    for (var i = 0; i < keys.length; i++) {
        let v = timeSlots[keys[i]].eventTime // [i]
        if(t > v) {
            /* continue to the next. */
            continue
        }

        activeSlot =  timeSlots[v]
        break
    }

    if(activeSlot != undefined && !activeSlot.visited) {
        let slotTime = activeSlot.eventTime
        /* Calulate the distance from the slot, if it's less than 2 seconds,
        call it*/
        let distance = slotTime - currentTime
        console.log('this one is next in:', distance)
        if(distance >= 2) {
            /* Too far out, we'll expect the clock to reinspect by that
            time. (seconds)*/
            return
        }

        activeSlot.visited = true
        setTimeout(()=>{
            activeSlot.slot(audio, audio.currentTime + distance)
        }, distance)
    }
});
