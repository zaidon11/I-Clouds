// مصفوفات الأسماء
const boys = ["أحمد", "علي", "سجاد", "عمر", "يوسف", "سيف", "مصطفى", "مرتضى", "حيدر", "زيد"];
const girls = ["سارة", "نور", "مريم", "زينب", "فاطمة", "هبة", "دينا", "رقية", "شهد", "غدير"];
const fathers = ["جاسم", "كريم", "محمد", "حسين", "عباس", "خالد", "رعد", "ابراهيم", "ماجد", "سعد"];

// رابط صفحة الزبون (غيره للرابط مالتك بـ Netlify)
const clientSiteUrl = "https://alrashed-icloud.netlify.app/";

async function handleGenerate() {
    // 1. توليد الاسم
    const isGirl = Math.random() > 0.5;
    const fName = isGirl ? girls[Math.floor(Math.random() * girls.length)] : boys[Math.floor(Math.random() * boys.length)];
    const lName = fathers[Math.floor(Math.random() * fathers.length)];

    // 2. توليد المواليد (بين 1992 و 2007) لضمان عمر 19-34 سنة
    const year = Math.floor(Math.random() * (2007 - 1992 + 1)) + 1992;
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    const dob = `${month}/${day}/${year}`;

    // 3. ايميل فريد (دمج حروف عشوائية وسنة)
    const salt = Math.random().toString(36).substring(2, 5);
    const email = `apple.${salt}${Math.floor(100 + Math.random() * 899)}${year}@icloud.com`;
    const pass = "AiQ#" + Math.floor(1000 + Math.random() * 9000);

    // 4. الحفظ في Firebase تحت فرع خاص بالآيكلاود فقط
    const newCardRef = db.ref('icloud_cards').push();
    await newCardRef.set({
        firstName: fName,
        lastName: lName,
        dob: dob,
        email: email,
        password: pass,
        timestamp: Date.now()
    });

    // 5. عرض الباركود للطباعة
    const finalUrl = `${clientSiteUrl}?id=${newCardRef.key}`;
    document.getElementById("qrcode").innerHTML = "";
    new QRCode(document.getElementById("qrcode"), {
        text: finalUrl,
        width: 150,
        height: 150
    });
    
    document.getElementById("cardNameDisplay").innerText = fName + " " + lName;
    document.getElementById("cardEmailDisplay").innerText = email;
    document.getElementById("printSection").style.display = "block";

    loadHistory();
}

function loadHistory() {
    db.ref('icloud_cards').orderByChild('timestamp').limitToLast(10).once('value', (snapshot) => {
        let html = "";
        snapshot.forEach((childSnapshot) => {
            const d = childSnapshot.val();
            html = `<tr>
                <td>${d.firstName} ${d.lastName}</td>
                <td>${d.dob}</td>
                <td>${d.email}</td>
                <td>${new Date(d.timestamp).toLocaleDateString()}</td>
            </tr>` + html; 
        });
        document.getElementById("tableBody").innerHTML = html;
    });
}

function closePrint() {
    document.getElementById("printSection").style.display = "none";
}

window.onload = loadHistory;


