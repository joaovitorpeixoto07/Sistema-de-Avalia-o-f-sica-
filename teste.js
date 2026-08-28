const response = {
    "type": "application/vnd.iris.desk.attendance-hour-container+json",
    "resource": {
        "attendanceHour": {
            "id": "0eba8147-0733-47f4-90fd-019d9133145a",
            "title": "Horário Regular",
            "description": "Horário de atendimento padrão",
            "isMain": true,
            "ownerIdentity": "ucnurmexicoatendimento1@msging.net",
            "storageDate": "2026-04-15T12:52:17.114Z",
            "modifyDate": "2026-05-05T21:25:36.473Z",
            "timeZoneId": "Central Standard Time (Mexico)"
        },
        "attendanceHourScheduleItems": [
            {
                "id": "f6e4c353-24a9-4fbc-b383-019dfa083a75",
                "startTime": "11:00:00",
                "endTime": "20:00:00",
                "dayOfWeek": "Monday"
            },
            {
                "id": "aa230357-18df-430e-a575-019dfa083a75",
                "startTime": "11:00:00",
                "endTime": "20:00:00",
                "dayOfWeek": "Tuesday"
            },
            {
                "id": "9f0b04ca-dd4b-41e3-ab9d-019dfa083a75",
                "startTime": "11:00:00",
                "endTime": "20:00:00",
                "dayOfWeek": "Wednesday"
            },
            {
                "id": "7546cb9a-80eb-4756-84a6-019dfa083a75",
                "startTime": "11:00:00",
                "endTime": "20:00:00",
                "dayOfWeek": "Thursday"
            },
            {
                "id": "61ac3622-4637-465e-b116-019dfa083a75",
                "startTime": "11:00:00",
                "endTime": "20:00:00",
                "dayOfWeek": "Friday"
            }
        ],
        "attendanceHourOffItems": [],
        "queues": [],
        "attendants": []
    },
    "method": "get",
    "status": "success",
    "id": "74f77867-849b-4835-859e-706d9ec6299f",
    "from": "postmaster@desk.msging.net/!msging-application-desk-698bd8ddf7-spz52",
    "to": "ucnurmexicoatendimento1@msging.net/!msging-server-57894686b6-fhgtl-592url6i",
    "metadata": {
        "traceparent": "00-e420a0daa9551fb2573be01a81a17373-2326b1729070b11d-01",
        "#command.uri": "lime://ucnurmexicoatendimento1@msging.net/attendance-hour-container/0eba8147-0733-47f4-90fd-019d9133145a",
        "#metrics.custom.label": "processor:default"
    }
}

const DEFAULT_TIMEZONE_MAP = {
    'Central Standard Time (Mexico)': 'America/Mexico_City'
}

const run = (response) => {
    const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
    const timeZoneMap = getRequestTimeZoneMap(parsedResponse);
    const timeZone = getTimeZone(parsedResponse, timeZoneMap);
    const dayOfWeek = processDayOfWeek(timeZone);
    const todaysSchedule = getTodaysSchedule(parsedResponse, dayOfWeek);

    return isWorkingHours(todaysSchedule, timeZone);
}

const isWorkingHours = (schedule, timeZone) => {
    const current = getCurrentTimeParts(timeZone);
    const currentSeconds = toSeconds(current.hour, current.minute, current.second);

    for (let i = 0; i < schedule.length; i++) {
        const startSeconds = toSecondsFromString(schedule[i].startTime);
        const endSeconds = toSecondsFromString(schedule[i].endTime);

        if (currentSeconds >= startSeconds && currentSeconds < endSeconds) {
            return true;
        }
    }

    return false;
}

const getCurrentTimeParts = (timeZone) => {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour12: false,
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).formatToParts(new Date());

    return {
        weekday: parts.find(part => part.type === 'weekday').value,
        hour: Number(parts.find(part => part.type === 'hour').value),
        minute: Number(parts.find(part => part.type === 'minute').value),
        second: Number(parts.find(part => part.type === 'second').value)
    };
}

const processDayOfWeek = (timeZone) => {
    const weekday = new Intl.DateTimeFormat('en-US', {
        timeZone,
        weekday: 'long'
    }).format(new Date());

    return weekday;
}

const toSecondsFromString = (time) => {
    const [hour, minute, second] = time.split(':').map(Number);
    return toSeconds(hour, minute, second);
}

const toSeconds = (hour, minute, second) => {
    return hour * 3600 + minute * 60 + second;
}

const getTodaysSchedule = (response, dayOfWeek) => {
    const resource = response.resource.attendanceHourScheduleItems;
    return resource.filter(item => item.dayOfWeek === dayOfWeek);
}

const getRequestTimeZoneMap = (response) => {
    const requestMap = response.resource?.attendanceHour?.timeZoneMap;
    return requestMap && typeof requestMap === 'object' ? requestMap : DEFAULT_TIMEZONE_MAP;
}

const getTimeZone = (response, timezoneMap) => {
    const rawZone = response.resource.attendanceHour.timeZoneId;
    return timezoneMap[rawZone] || rawZone;
}

console.log(run(response));
