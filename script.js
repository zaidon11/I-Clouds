// مصفوفات الأسماء المتناسقة
const boys = ["أحمد", "علي", "سجاد", "عمر", "يوسف", "سيف", "مصطفى", "مرتضى", "حيدر", "زيد", "عباس", "حسين"];
const girls = ["سارة", "نور", "مريم", "زينب", "فاطمة", "هبة", "دينا", "رقية", "شهد", "غدير", "ليلى", "آية"];
const fathers = ["جاسم", "كريم", "محمد", "حسين", "عباس", "خالد", "رعد", "ابراهيم", "ماجد", "سعد", "فيصل", "عادل"];

// الرابط الخاص بصفحة الزبون اللي دزيته إنت
const clientSiteUrl = "https://alrashed-icloud.netlify.app/";

async function handleGenerate() {
    // 1. اختيار نوع الاسم
    const isGirl = Math.random() > 0.5;
    const fName = isGirl ? girls[Math.floor(Math.random() * girls.length)] : boys[Math.floor(Math.random() * boys.length)];
    const lName = fathers[Math.floor(Math.random() * fathers.length)];

    // 2. المواليد (بين 19 و 34 سنة)
    const year = Math.floor(Math.random() * (2007 - 1992 + 1)) + 1992;
    const dob = `${Math.floor(Math.random() * 12) + 1}/${Math.floor(Math.random() * 28) + 1}/${year}`;

    // 3. ايميل احترافي (يبدأ بالاسم)
    const salt = Math.random().toString(36).substring(2, 5);
    const email = `${fName.toLowerCase()}.${salt}${Math.floor(100 + Math.random() * 899)}${year}@icloud.com`.replace(/[^a-z0-9.@]/gi, '');
    const pass = "AiQ#" + Math.floor(1000 + Math.random() * 9000);

    // 4. الحفظ في Firebase
    const newCardRef = db.ref('icloud_cards').push();
    await newCardRef.set({
        firstName: fName,
        lastName: lName,
        dob: dob,
        email: email,
        password: pass,
        timestamp: Date.now()
    });

    // عرض الباركود فوراً بعد التوليد
    showQRCode(newCardRef.key);
    loadHistory();
}

// دالة عرض الباركود (تستخدم للجديد والقديم)
function showQRCode(id) {
    // إضافة السلاش والأيدي للرابط
    const finalUrl = `${clientSiteUrl}?id=${id}`;
    
    document.getElementById("qrcode").innerHTML = "";
    new QRCode(document.getElementById("qrcode"), {
        text: finalUrl,
        width: 180,
        height: 180,
        correctLevel : QRCode.CorrectLevel.H
    });
    
    document.getElementById("printSection").style.display = "block";
    // تمرير الشاشة للباركود حتى تشوفه
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function loadHistory() {
    db.ref('icloud_cards').orderByChild('timestamp').limitToLast(15).once('value', (snapshot) => {
        let html = "";
        snapshot.forEach((childSnapshot) => {
            const d = childSnapshot.val();
            const id = childSnapshot.key;
            html = `<tr>
                <td>${d.firstName} ${d.lastName}</td>
                <td>${d.email}</td>
                <td>${d.dob}</td>
                <td>
                    <button class="view-btn" onclick="showQRCode('${id}')">👁️ عرض الكود</button>
                </td>
            </tr>` + html; 
        });
        document.getElementById("tableBody").innerHTML = html;
    });
}

function closePrint() {
    document.getElementById("printSection").style.display = "none";
}

window.onload = loadHistory;
