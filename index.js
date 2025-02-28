const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = require('@whiskeysockets/baileys');
const fs = require('fs');

const startBot = async () => {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const { version } = await fetchLatestBaileysVersion();
    let lastMessage = {}; 

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
        browser: ['Chrome (Linux)', '', ''],
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
            console.log('✅ WhatsApp Bot Connected!');
        } else if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('❌ Disconnected, trying to reconnect...', shouldReconnect);

            if (shouldReconnect) {
                startBot();  // Restart koneksi
            } else {
                console.log('🛑 Logout detected, please scan QR code again.');
                fs.rmSync('auth_info', { recursive: true, force: true });
            }
        }
    });

    // Fungsi untuk mengirim pesan dengan delay
    const sendReplyDelayed = (sock, sender, reply) => {
        const delay = Math.floor(Math.random() * 1000) + 1000; // 1-2 detik
        setTimeout(async () => {
            await sock.sendMessage(sender, { text: reply });
        }, delay);
    };

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return; // Abaikan pesan yang dikirim oleh bot sendiri

        const sender = msg.key.remoteJid;
        const textMessage = msg.message.conversation || msg.message.extendedTextMessage?.text;
        
        if (!textMessage) return; // Abaikan pesan yang bukan teks

        // Cek apakah pesan yang sama sudah dibalas sebelumnya
        if (lastMessage[sender] === textMessage.trim()) return;
        lastMessage[sender] = textMessage.trim(); // Simpan pesan terakhir

        console.log(`Message from ${sender}: ${textMessage}`);

        let reply;
        switch (textMessage.trim().toLowerCase()) {
            case '1':
                reply = `Baik! Silakan pilih jadwal dan kursus yang ingin kamu coba. Kami siap bantu biar kamu bisa belajar dengan nyaman! 😊\n\n` +
                        `Balas pesan ini dengan format berikut:\n\n` +
                        `🗓 *Hari*: (Pilih hari selain besok)\n` +
                        `⏰ *Jam*: (Tentukan waktu yang sesuai)\n\n` +
                        `Kalau butuh bantuan, jangan ragu buat tanya ya! Kami siap membantu. 🚀✨`;
                break;
            case '2':
                reply = `Kami menyediakan berbagai kelas seru buat kamu yang ingin belajar coding dan desain! 🚀✨\n\n` +
                        `📌 *Pilihan Kelas:*\n` +
                        `- *Python*\n` +
                        `- *C++*\n` +
                        `- *Web Design*\n` +
                        `- *Web App*\n` +
                        `- *Android Development*\n` +
                        `- *Design Basic*\n` +
                        `- *Design Pro*\n` +
                        `- *Block Programming*\n` +
                        `📅 *Jadwal Fleksibel* – Bisa menyesuaikan dengan peserta!\n\n` +
                        `Mau mulai belajar? Balas pesan ini dengan format berikut:\n\n` +
                        `🗓 *Hari*: (Pilih hari selain besok)\n` +
                        `⏰ *Jam*: (Tentukan waktu yang sesuai)\n` +
                        `📚 *Kelas*: (Pilih kelas yang ingin diikuti)\n\n` +
                        `Kami tunggu ya! 🚀😊`;
                break;
            case '3':
                reply = `💰 *Harga & Paket Kursus* 💰\n\n` +
                        `🔹 *Private (1 sesi = 1 jam)*\n` +
                        `• 4 pertemuan atau 1 bulan\n → Rp 300.000\n\n` +
                        `• 8 pertemuan atau 2 bulan\n → Rp 600.000\n\n` +
                        `• 16 pertemuan atau 4 bulan\n → Rp 1.200.000\n\n` +
                        `• 24 pertemuan atau 6 bulan\n → Rp 1.800.000\n\n` +
                        `🔹 *Group Reguler (10 orang, 1 sesi = 1 jam)*\n` +
                        `• 4 pertemuan atau 1 bulan\n → Rp 50.000\n\n` +
                        `• 8 pertemuan atau 2 bulan\n → Rp 100.000\n\n` +
                        `• 16 pertemuan atau 4 bulan\n → Rp 200.000\n\n` +
                        `• 24 pertemuan atau 6 bulan\n → Rp 300.000\n\n` +
                        `🔹 *Group VIP (5 orang, 1 sesi = 1 jam)*\n` +
                        `• 4 pertemuan atau 1 bulan\n → Rp 100.000\n\n` +
                        `• 8 pertemuan atau 2 bulan\n → Rp 200.000\n\n` +
                        `• 16 pertemuan atau 4 bulan\n → Rp 400.000\n\n` +
                        `• 24 pertemuan atau 6 bulan\n → Rp 600.000\n\n` +
                        `Tertarik? Balas pesan ini dengan format:\n` + 
                        `*PRIV/GROUP PAKET KURSUS*\n` +
                        `Contoh:\n`+
                        `🔹 *Private 8 C++*\n` +
                        `🔹 *Group Reguler 16 Web Design*`;
                break;
            case '4':
                reply = `📩 *Cara Daftar:*\n\n` +
                        `Cukup balas pesan ini dengan format:\n` +
                        `*PRIV/GROUP PAKET KURSUS*\n` +
                        `Contoh:\n`+
                        `🔹 *Private 8 C++*\n` +
                        `🔹 *Group Reguler 16 Web Design*\n\n` +
                        `Ayo upgrade skill-mu sekarang! 🚀🔥`;
                break;
            case '5':
                reply = `Tentu! Jangan ragu untuk bertanya ya. Admin kami siap membantu dan akan segera membalas pesan kamu! 😊`;
                break;
            case 'menu':
                reply = `🎉 Selamat Datang di Triraya Academy! 🎉\n\n` +
                        `Hai! Saya Triraya Robot 👋 Senang banget bisa ketemu kamu di sini. Yuk, pilih menu di bawah ini:\n\n` +
                        `📚 1. Jadwal Kelas – Temukan jadwal kelas yang cocok sekarang!\n` +
                        `📖 2. Info Kelas – Lihat detail kelas & jadwalnya.\n` +
                        `💰 3. Harga – Cek daftar harga & paket kelas.\n` +
                        `📝 4. Pesan – Mau daftar atau konsultasi? Hubungi kami!\n` +
                        `❓ 5. Tanya – Ada yang mau ditanyain? Kami siap bantu!\n\n` +
                        `Balas pesan ini dengan 1, 2, 3, 4, atau 5 ya! 📩🚀`;
                break;
            default:
                reply = "";
        }

        // Kirim pesan dengan delay
        if (reply) {
            sendReplyDelayed(sock, sender, reply);
        }
        // sendReplyDelayed(sock, sender, reply);
    });
};
startBot();
