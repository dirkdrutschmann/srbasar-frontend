import { v4 as uuidv4 } from 'uuid';

// Hilfsfunktion zur Formatierung von Datum und Uhrzeit im iCal-Format
const formatICalDateTime = (date) => {
    return (
        date.getUTCFullYear() +
        ('0' + (date.getUTCMonth() + 1)).slice(-2) +
        ('0' + date.getUTCDate()).slice(-2) +
        'T' +
        ('0' + date.getUTCHours()).slice(-2) +
        ('0' + date.getUTCMinutes()).slice(-2) +
        ('0' + date.getUTCSeconds()).slice(-2) +
        'Z'
    );
}

export const generateICal = (events, vereine) => {
    // Beginnen Sie mit dem iCal-Header
    let icalData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SPIELEBASAR//DIRKD//EN`;

    // Durchlaufen Sie die Liste der Events und fügen Sie sie zur iCal-Datei hinzu
    events.forEach((event) => {
        let startDate = new Date(event.kickoffDate+"T"+event.kickoffTime+":00")
        let endDate = new Date(event.kickoffDate+"T"+event.kickoffTime+":00")
        endDate.setHours(endDate.getHours() +2 )
        let description = event.homeTeam + " - " + event.guestTeam
        let summary = event.liganame
        if(vereine.includes(event.sr1)){
            summary += " | 1.SR: " + event.sr1
        }else{
            description += " | 1.SR: " + event.sr1
        }
        if(vereine.includes(event.sr2)){
           summary +=  " | 2.SR:" + event.sr2
        }else{
            description += " | 2.SR:" + event.sr2
        }
        icalData += `
BEGIN:VEVENT
UID:${uuidv4()}
DTSTAMP:${formatICalDateTime(new Date())}
DTSTART:${formatICalDateTime(startDate)}
DTEND:${formatICalDateTime(endDate)}
SUMMARY:${summary}
DESCRIPTION:${description}
LOCATION:${event.spielfeld}
END:VEVENT`;
    });

    // Fügen Sie den iCal-Fußzeile hinzu
    icalData += `
END:VCALENDAR`;

    // Erstellen Sie die iCal-Datei als Blob
    const blob = new Blob([icalData], { type: 'text/calendar' });

    // Erzeugen Sie eine URL für die Blob-Daten
    const url = window.URL.createObjectURL(blob);

    // Erstellen Sie ein unsichtbares <a> -Element, um die Datei herunterzuladen
    const a = document.createElement('a');
    a.href = url;
    a.download = 'events.ics';

    // Klicken Sie auf das <a> -Element, um den Download auszulösen
    a.click();

    // Löschen Sie die URL und das <a> -Element
    window.URL.revokeObjectURL(url);
}

