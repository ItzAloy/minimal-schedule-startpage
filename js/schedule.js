let scheduleData = null;
let scheduleUpdateInterval = null;

// Helper function to format duration from decimal to readable format
function formatDuration(duration) {
    const hours = Math.floor(duration);
    const minutes = Math.round((duration - hours) * 60);
    
    if (hours === 0) {
        return `${minutes} menit`;
    } else if (minutes === 0) {
        return `${hours} jam`;
    } else {
        return `${hours} jam ${minutes} menit`;
    }
}

const daysOfWeek = {
    0: 'sunday',
    1: 'monday', 
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday'
};

const dayNames = {
    'sunday': 'Minggu',
    'monday': 'Senin',
    'tuesday': 'Selasa', 
    'wednesday': 'Rabu',
    'thursday': 'Kamis',
    'friday': 'Jumat',
    'saturday': 'Sabtu'
};

function initSchedule() {
    if (!scheduleData || !scheduleData.enabled) {
        hideScheduleContainer();
        return;
    }
    
    // Ensure DOM is ready
    setTimeout(() => {
        updateScheduleDisplay();
        
        // Update schedule every minute
        if (scheduleUpdateInterval) {
            clearInterval(scheduleUpdateInterval);
        }
        scheduleUpdateInterval = setInterval(updateScheduleDisplay, 60000);
    }, 100);
}

function hideScheduleContainer() {
    const container = document.getElementById('schedule-container');
    if (container) {
        container.style.display = 'none';
    }
}

function showScheduleContainer() {
    const container = document.getElementById('schedule-container');
    if (container) {
        container.style.display = 'block';
    }
}

function updateScheduleDisplay() {
    const now = new Date();
    const dayName = daysOfWeek[now.getDay()];
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes
    
    // Update title with current day
    const titleEl = document.getElementById('schedule-title');
    if (titleEl) {
        titleEl.textContent = `Jadwal Pembelajaran - ${dayNames[dayName]}`;
    }
    
    const todayClasses = scheduleData.classes[dayName] || [];
    
    if (todayClasses.length === 0) {
        displayNoClasses(dayName);
        return;
    }
    
    showScheduleContainer();
    
    // Convert class times to minutes and add end times
    const classesWithTimes = todayClasses.map(cls => {
        const [hours, minutes] = cls.startTime.split(':').map(Number);
        const startMinutes = hours * 60 + minutes;
        const endMinutes = startMinutes + (cls.duration * 60);
        
        return {
            ...cls,
            startMinutes,
            endMinutes
        };
    });
    
    // Find current class
    let currentClass = null;
    let nextClass = null;
    
    for (let cls of classesWithTimes) {
        if (currentTime >= cls.startMinutes && currentTime < cls.endMinutes) {
            currentClass = cls;
            break;
        }
    }
    
    // Find next class
    for (let cls of classesWithTimes) {
        if (currentTime < cls.startMinutes) {
            nextClass = cls;
            break;
        }
    }
    
    updateCurrentClass(currentClass, currentTime);
    updateNextClass(nextClass);
}

function updateCurrentClass(currentClass, currentTime) {
    const currentTimeEl = document.getElementById('current-time');
    const currentSubjectEl = document.getElementById('current-subject');
    const currentTeacherEl = document.getElementById('current-teacher');
    const currentDurationEl = document.getElementById('current-duration');
    const classStatusEl = document.getElementById('class-status');
    const currentClassContainer = document.querySelector('.current-class');
    
    if (currentClass) {
        currentTimeEl.textContent = currentClass.startTime;
        currentSubjectEl.textContent = currentClass.subject;
        currentTeacherEl.textContent = currentClass.teacher || '--';
        currentDurationEl.textContent = formatDuration(currentClass.duration);
        classStatusEl.textContent = 'Sedang berlangsung';
        
        // Update styling for active class
        currentClassContainer.classList.remove('finished', 'waiting');
        currentClassContainer.classList.add('active');
        classStatusEl.classList.remove('finished', 'waiting');
        classStatusEl.classList.add('active');
    } else {
        // Check if there was a class that just ended
        const todayClasses = getTodayClasses();
        let lastFinishedClass = null;
        let hasUpcomingClass = false;
        
        for (let cls of todayClasses) {
            if (currentTime >= cls.endMinutes) {
                lastFinishedClass = cls;
            }
            if (currentTime < cls.startMinutes) {
                hasUpcomingClass = true;
            }
        }
        
        if (lastFinishedClass && hasUpcomingClass) {
            // There are more classes today
            currentTimeEl.textContent = lastFinishedClass.startTime;
            currentSubjectEl.textContent = lastFinishedClass.subject;
            currentTeacherEl.textContent = lastFinishedClass.teacher || '--';
            currentDurationEl.textContent = formatDuration(lastFinishedClass.duration);
            classStatusEl.textContent = 'Selesai - Istirahat';
            
            // Update styling for finished class
            currentClassContainer.classList.remove('active', 'waiting');
            currentClassContainer.classList.add('finished');
            classStatusEl.classList.remove('active', 'waiting');
            classStatusEl.classList.add('finished');
        } else if (lastFinishedClass) {
            // All classes for today are finished
            currentTimeEl.textContent = lastFinishedClass.startTime;
            currentSubjectEl.textContent = lastFinishedClass.subject;
            currentTeacherEl.textContent = lastFinishedClass.teacher || '--';
            currentDurationEl.textContent = formatDuration(lastFinishedClass.duration);
            classStatusEl.textContent = 'Selesai - Hari ini selesai';
            
            currentClassContainer.classList.remove('active', 'waiting');
            currentClassContainer.classList.add('finished');
            classStatusEl.classList.remove('active', 'waiting');
            classStatusEl.classList.add('finished');
        } else {
            // No current class, waiting for first class
            const nextTodayClass = todayClasses.find(cls => currentTime < cls.startMinutes);
            if (nextTodayClass) {
                currentTimeEl.textContent = nextTodayClass.startTime;
                currentSubjectEl.textContent = nextTodayClass.subject;
                currentTeacherEl.textContent = nextTodayClass.teacher || '--';
                currentDurationEl.textContent = formatDuration(nextTodayClass.duration);
                classStatusEl.textContent = 'Menunggu kelas dimulai';
                
                // Update styling for waiting class
                currentClassContainer.classList.remove('active', 'finished');
                currentClassContainer.classList.add('waiting');
                classStatusEl.classList.remove('active', 'finished');
                classStatusEl.classList.add('waiting');
            } else {
                currentTimeEl.textContent = '--:--';
                currentSubjectEl.textContent = 'Tidak ada kelas saat ini';
                currentTeacherEl.textContent = '--';
                currentDurationEl.textContent = '-- menit';
                classStatusEl.textContent = 'Menunggu jadwal';
                
                // Reset styling
                currentClassContainer.classList.remove('active', 'finished', 'waiting');
                classStatusEl.classList.remove('active', 'finished', 'waiting');
            }
        }
    }
}

function updateNextClass(nextClass) {
    const nextTimeEl = document.getElementById('next-time');
    const nextSubjectEl = document.getElementById('next-subject');
    const nextTeacherEl = document.getElementById('next-teacher');
    const nextDurationEl = document.getElementById('next-duration');
    
    if (nextClass) {
        nextTimeEl.textContent = nextClass.startTime;
        nextSubjectEl.textContent = nextClass.subject;
        nextTeacherEl.textContent = nextClass.teacher || '--';
        nextDurationEl.textContent = formatDuration(nextClass.duration);
    } else {
        // Check if there are classes tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDayName = daysOfWeek[tomorrow.getDay()];
        const tomorrowClasses = scheduleData.classes[tomorrowDayName] || [];
        
        if (tomorrowClasses.length > 0) {
            const firstTomorrowClass = tomorrowClasses[0];
            nextTimeEl.textContent = `${dayNames[tomorrowDayName]} ${firstTomorrowClass.startTime}`;
            nextSubjectEl.textContent = firstTomorrowClass.subject;
            nextTeacherEl.textContent = firstTomorrowClass.teacher || '--';
            nextDurationEl.textContent = formatDuration(firstTomorrowClass.duration);
        } else {
            nextTimeEl.textContent = '--:--';
            nextSubjectEl.textContent = 'Tidak ada kelas lagi';
            nextTeacherEl.textContent = '--';
            nextDurationEl.textContent = '-- menit';
        }
    }
}

function getTodayClasses() {
    const now = new Date();
    const dayName = daysOfWeek[now.getDay()];
    const todayClasses = scheduleData.classes[dayName] || [];
    
    return todayClasses.map(cls => {
        const [hours, minutes] = cls.startTime.split(':').map(Number);
        const startMinutes = hours * 60 + minutes;
        const endMinutes = startMinutes + (cls.duration * 60);
        
        return {
            ...cls,
            startMinutes,
            endMinutes
        };
    });
}

function displayNoClasses(dayName) {
    showScheduleContainer();
    
    // Update title
    const titleEl = document.getElementById('schedule-title');
    if (titleEl) {
        titleEl.textContent = `Jadwal Pembelajaran - ${dayNames[dayName]}`;
    }
    
    const currentTimeEl = document.getElementById('current-time');
    const currentSubjectEl = document.getElementById('current-subject');
    const currentTeacherEl = document.getElementById('current-teacher');
    const currentDurationEl = document.getElementById('current-duration');
    const classStatusEl = document.getElementById('class-status');
    const nextTimeEl = document.getElementById('next-time');
    const nextSubjectEl = document.getElementById('next-subject');
    const nextTeacherEl = document.getElementById('next-teacher');
    const nextDurationEl = document.getElementById('next-duration');
    const currentClassContainer = document.querySelector('.current-class');
    
    currentTimeEl.textContent = '--:--';
    currentSubjectEl.textContent = 'Tidak ada kelas hari ini';
    currentTeacherEl.textContent = '--';
    currentDurationEl.textContent = '-- menit';
    classStatusEl.textContent = 'Hari libur';
    
    // Check tomorrow's classes
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDayName = daysOfWeek[tomorrow.getDay()];
    const tomorrowClasses = scheduleData.classes[tomorrowDayName] || [];
    
    if (tomorrowClasses.length > 0) {
        const firstTomorrowClass = tomorrowClasses[0];
        nextTimeEl.textContent = `${dayNames[tomorrowDayName]} ${firstTomorrowClass.startTime}`;
        nextSubjectEl.textContent = firstTomorrowClass.subject;
        nextTeacherEl.textContent = firstTomorrowClass.teacher || '--';
        nextDurationEl.textContent = formatDuration(firstTomorrowClass.duration);
    } else {
        nextTimeEl.textContent = '--:--';
        nextSubjectEl.textContent = 'Belum ada jadwal';
        nextTeacherEl.textContent = '--';
        nextDurationEl.textContent = '-- menit';
    }
    
    // Reset styling
    currentClassContainer.classList.remove('active', 'finished', 'waiting');
    classStatusEl.classList.remove('active', 'finished', 'waiting');
}

function loadScheduleConfig(configData) {
    scheduleData = configData.schedule;
    
    // Clear existing interval
    if (scheduleUpdateInterval) {
        clearInterval(scheduleUpdateInterval);
    }
    
    initSchedule();
}

// Export for use in main.js
window.scheduleModule = {
    loadScheduleConfig,
    initSchedule
};
