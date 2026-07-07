import express from "express";
import cors from "cors";
import path from "path";
import { getDb, saveDb, getCached, setCache } from "./database";
import { initSchema } from "./schema";
import authRoutes from "./routes/auth";
import vocabularyRoutes from "./routes/vocabulary";
import grammarRoutes from "./routes/grammar";
import exercisesRoutes from "./routes/exercises";
import progressRoutes from "./routes/progress";
import adminRoutes from "./routes/admin";
 
const app = express();
const PORT = parseInt(process.env.PORT || "3001");

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/vocabulary", vocabularyRoutes);
app.use("/api/grammar", grammarRoutes);
app.use("/api/exercises", exercisesRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/translate/:word", async (req, res) => {
  const word = req.params.word.trim().toLowerCase();
  if (!word) return res.status(400).json({ error: "Word is required" });

  try {
    const db = await getDb();
    // 1. Check local vocabulary DB first
    const local = db.exec("SELECT word, meaning, phonetic FROM vocabulary_words WHERE LOWER(word) = ?", [word]);
    if (local.length > 0 && local[0].values.length > 0) {
      const row = local[0];
      const data = row.values.map((v: any[]) => {
        const obj: any = {};
        row.columns.forEach((col: string, i: number) => { obj[col] = v[i]; });
        return obj;
      });
      return res.json({ source: "local", word, translations: data.map((d: any) => d.meaning), phonetic: data[0].phonetic });
    }

    // 2. Check cache
    const cached = await getCached<{ translations: string[] }>(`translate:${word}`);
    if (cached) {
      return res.json({ source: "cache", word, translations: cached.translations, phonetic: null });
    }

    // 3. Falls back to MyMemory API
    const apiRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|vi`);
    const apiData: any = await apiRes.json();

    if (apiData.responseStatus === 200 && apiData.responseData?.translatedText) {
      let translation = apiData.responseData.translatedText;
      if (translation.toLowerCase() === word) {
        return res.json({ source: "none", word, translations: [], message: "Không tìm thấy bản dịch" });
      }
      // Cache result
      await setCache(`translate:${word}`, { translations: [translation] });
      return res.json({ source: "mymemory", word, translations: [translation], phonetic: null });
    }

    res.json({ source: "none", word, translations: [], message: "Không tìm thấy bản dịch" });
  } catch (err) {
    // Try cache on error
    const cached = await getCached<{ translations: string[] }>(`translate:${word}`);
    if (cached) {
      return res.json({ source: "cache", word, translations: cached.translations, phonetic: null });
    }
    res.json({ source: "none", word, translations: [], message: "Không thể kết nối dịch vụ dịch thuật" });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Serve built frontend in production
const clientDist = path.join(__dirname, "../../client/dist");
app.use(express.static(clientDist));
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

async function migratePasswords() {
  const db = await getDb();
  const result = db.exec("SELECT id, password FROM users WHERE password NOT LIKE '$2%'");
  if (result.length && result[0].values.length) {
    const bcrypt = await import("bcryptjs");
    for (const row of result[0].values) {
      const id = row[0] as number;
      const plain = row[1] as string;
      const hashed = await bcrypt.hash(plain, 10);
      db.run("UPDATE users SET password = ? WHERE id = ?", [hashed, id]);
    }
    saveDb();
    console.log(`Migrated ${result[0].values.length} plain text passwords to bcrypt`);
  }
}

async function addExtraContent() {
  const db = await getDb();
  // Check if we already added extra content by looking for one of the new topics
  const existing = db.exec("SELECT id FROM vocabulary_topics WHERE name = ?", ["Clothes & Fashion"]);
  if (existing.length && existing[0].values.length) return;

  // === EXTRA VOCABULARY TOPICS ===
  const extraTopics = [
    { name: "Clothes & Fashion", description: "Clothing items, accessories, and fashion vocabulary", level: "beginner", icon: "👗", order_index: 16 },
    { name: "Weather & Seasons", description: "Weather conditions, seasons, and climate vocabulary", level: "beginner", icon: "☁️", order_index: 17 },
    { name: "Sports & Hobbies", description: "Sports, recreational activities, and hobbies", level: "beginner", icon: "⚽", order_index: 18 },
    { name: "Animals & Nature", description: "Animals, plants, and natural world vocabulary", level: "beginner", icon: "🐘", order_index: 19 },
    { name: "House & Furniture", description: "Rooms, furniture, and household items", level: "beginner", icon: "🏠", order_index: 20 },
    { name: "Emotions & Feelings", description: "Emotions, feelings, and states of mind", level: "intermediate", icon: "😊", order_index: 21 },
    { name: "School & Education", description: "School subjects, classroom objects, and education terms", level: "beginner", icon: "🎒", order_index: 22 },
    { name: "Shopping & Money", description: "Shopping vocabulary, money, and payments", level: "intermediate", icon: "🛒", order_index: 23 },
  ];

  for (const t of extraTopics) {
    db.run("INSERT INTO vocabulary_topics (name, description, level, icon, order_index) VALUES (?, ?, ?, ?, ?)",
      [t.name, t.description, t.level, t.icon, t.order_index]);
  }

  // Get topic IDs
  const topicRows = db.exec("SELECT id, name FROM vocabulary_topics");
  const topicMap: Record<string, number> = {};
  for (const row of topicRows[0].values) {
    topicMap[row[1] as string] = row[0] as number;
  }

  const extraWords: Record<string, Array<{ word: string; meaning: string; phonetic: string; example: string; part_of_speech: string }>> = {
    "Clothes & Fashion": [
      { word: "Shirt", meaning: "Áo sơ mi", phonetic: "/ʃɜːrt/", example: "He wore a white shirt to the interview.", part_of_speech: "noun" },
      { word: "Trousers", meaning: "Quần tây", phonetic: "/ˈtraʊzərz/", example: "These trousers are too long for me.", part_of_speech: "noun" },
      { word: "Dress", meaning: "Váy", phonetic: "/dres/", example: "She bought a beautiful red dress.", part_of_speech: "noun" },
      { word: "Jacket", meaning: "Áo khoác", phonetic: "/ˈdʒækɪt/", example: "Bring your jacket because it's cold outside.", part_of_speech: "noun" },
      { word: "Shoes", meaning: "Giày", phonetic: "/ʃuːz/", example: "I need new running shoes.", part_of_speech: "noun" },
      { word: "Hat", meaning: "Mũ", phonetic: "/hæt/", example: "She wears a hat to protect from the sun.", part_of_speech: "noun" },
      { word: "Socks", meaning: "Tất", phonetic: "/sɒks/", example: "I need to buy new socks.", part_of_speech: "noun" },
      { word: "Belt", meaning: "Thắt lưng", phonetic: "/belt/", example: "He put on a leather belt.", part_of_speech: "noun" },
      { word: "Wallet", meaning: "Ví", phonetic: "/ˈwɒlɪt/", example: "I left my wallet at home.", part_of_speech: "noun" },
      { word: "Watch", meaning: "Đồng hồ đeo tay", phonetic: "/wɒtʃ/", example: "My watch is five minutes fast.", part_of_speech: "noun" },
      { word: "Necklace", meaning: "Vòng cổ", phonetic: "/ˈnekləs/", example: "She wore a gold necklace.", part_of_speech: "noun" },
      { word: "Glasses", meaning: "Kính mắt", phonetic: "/ˈɡlæsɪz/", example: "He needs glasses to read.", part_of_speech: "noun" },
      { word: "Uniform", meaning: "Đồng phục", phonetic: "/ˈjuːnɪfɔːrm/", example: "Students must wear school uniform.", part_of_speech: "noun" },
      { word: "Pajamas", meaning: "Đồ ngủ", phonetic: "/pəˈdʒɑːməz/", example: "I wear comfortable pajamas to bed.", part_of_speech: "noun" },
      { word: "Sneakers", meaning: "Giày thể thao", phonetic: "/ˈsniːkərz/", example: "She wore sneakers for the hike.", part_of_speech: "noun" },
    ],
    "Weather & Seasons": [
      { word: "Sunny", meaning: "Nắng", phonetic: "/ˈsʌni/", example: "It's a sunny day today.", part_of_speech: "adjective" },
      { word: "Rainy", meaning: "Mưa", phonetic: "/ˈreɪni/", example: "The weather is rainy this week.", part_of_speech: "adjective" },
      { word: "Cloudy", meaning: "Nhiều mây", phonetic: "/ˈklaʊdi/", example: "It's cloudy but it may not rain.", part_of_speech: "adjective" },
      { word: "Windy", meaning: "Gió", phonetic: "/ˈwɪndi/", example: "It's very windy near the coast.", part_of_speech: "adjective" },
      { word: "Snowy", meaning: "Có tuyết", phonetic: "/ˈsnoʊi/", example: "We had a snowy winter this year.", part_of_speech: "adjective" },
      { word: "Storm", meaning: "Bão", phonetic: "/stɔːrm/", example: "The storm damaged many houses.", part_of_speech: "noun" },
      { word: "Temperature", meaning: "Nhiệt độ", phonetic: "/ˈtemprətʃər/", example: "The temperature dropped to 5°C.", part_of_speech: "noun" },
      { word: "Humidity", meaning: "Độ ẩm", phonetic: "/hjuːˈmɪdəti/", example: "The humidity is very high today.", part_of_speech: "noun" },
      { word: "Spring", meaning: "Mùa xuân", phonetic: "/sprɪŋ/", example: "Flowers bloom in spring.", part_of_speech: "noun" },
      { word: "Summer", meaning: "Mùa hè", phonetic: "/ˈsʌmər/", example: "Summer is the hottest season.", part_of_speech: "noun" },
      { word: "Autumn", meaning: "Mùa thu", phonetic: "/ˈɔːtəm/", example: "Leaves fall in autumn.", part_of_speech: "noun" },
      { word: "Winter", meaning: "Mùa đông", phonetic: "/ˈwɪntər/", example: "Winter is very cold in Hanoi.", part_of_speech: "noun" },
      { word: "Thunder", meaning: "Sấm", phonetic: "/ˈθʌndər/", example: "Thunder followed the lightning.", part_of_speech: "noun" },
      { word: "Lightning", meaning: "Chớp", phonetic: "/ˈlaɪtnɪŋ/", example: "The lightning struck a tree.", part_of_speech: "noun" },
      { word: "Flood", meaning: "Lũ lụt", phonetic: "/flʌd/", example: "The heavy rain caused flooding.", part_of_speech: "noun" },
    ],
    "Sports & Hobbies": [
      { word: "Football", meaning: "Bóng đá", phonetic: "/ˈfʊtbɔːl/", example: "Football is the most popular sport in Vietnam.", part_of_speech: "noun" },
      { word: "Swimming", meaning: "Bơi lội", phonetic: "/ˈswɪmɪŋ/", example: "Swimming is good exercise.", part_of_speech: "noun" },
      { word: "Cycling", meaning: "Đạp xe", phonetic: "/ˈsaɪklɪŋ/", example: "Cycling is great for health.", part_of_speech: "noun" },
      { word: "Reading", meaning: "Đọc sách", phonetic: "/ˈriːdɪŋ/", example: "My hobby is reading novels.", part_of_speech: "noun" },
      { word: "Gardening", meaning: "Làm vườn", phonetic: "/ˈɡɑːrdnɪŋ/", example: "She spends weekends gardening.", part_of_speech: "noun" },
      { word: "Photography", meaning: "Nhiếp ảnh", phonetic: "/fəˈtɒɡrəfi/", example: "He is interested in photography.", part_of_speech: "noun" },
      { word: "Guitar", meaning: "Đàn ghi ta", phonetic: "/ɡɪˈtɑːr/", example: "I play the guitar in my free time.", part_of_speech: "noun" },
      { word: "Dancing", meaning: "Khiêu vũ", phonetic: "/ˈdænsɪŋ/", example: "She enjoys dancing to pop music.", part_of_speech: "noun" },
      { word: "Camping", meaning: "Cắm trại", phonetic: "/ˈkæmpɪŋ/", example: "We went camping in the forest.", part_of_speech: "noun" },
      { word: "Fishing", meaning: "Câu cá", phonetic: "/ˈfɪʃɪŋ/", example: "My grandfather loves fishing.", part_of_speech: "noun" },
      { word: "Cooking", meaning: "Nấu ăn", phonetic: "/ˈkʊkɪŋ/", example: "Cooking is a useful life skill.", part_of_speech: "noun" },
      { word: "Chess", meaning: "Cờ vua", phonetic: "/tʃes/", example: "Let's play a game of chess.", part_of_speech: "noun" },
      { word: "Drawing", meaning: "Vẽ", phonetic: "/ˈdrɔːɪŋ/", example: "She is very good at drawing.", part_of_speech: "noun" },
      { word: "Singing", meaning: "Ca hát", phonetic: "/ˈsɪŋɪŋ/", example: "He enjoys singing in the shower.", part_of_speech: "noun" },
      { word: "Badminton", meaning: "Cầu lông", phonetic: "/ˈbædmɪntn/", example: "Badminton is popular in Asia.", part_of_speech: "noun" },
    ],
    "Animals & Nature": [
      { word: "Dog", meaning: "Chó", phonetic: "/dɒɡ/", example: "The dog is barking loudly.", part_of_speech: "noun" },
      { word: "Cat", meaning: "Mèo", phonetic: "/kæt/", example: "The cat is sleeping on the sofa.", part_of_speech: "noun" },
      { word: "Elephant", meaning: "Voi", phonetic: "/ˈelɪfənt/", example: "Elephants are the largest land animals.", part_of_speech: "noun" },
      { word: "Tiger", meaning: "Hổ", phonetic: "/ˈtaɪɡər/", example: "The tiger is an endangered species.", part_of_speech: "noun" },
      { word: "Bird", meaning: "Chim", phonetic: "/bɜːrd/", example: "Birds are singing in the trees.", part_of_speech: "noun" },
      { word: "Fish", meaning: "Cá", phonetic: "/fɪʃ/", example: "There are colorful fish in the aquarium.", part_of_speech: "noun" },
      { word: "Tree", meaning: "Cây", phonetic: "/triː/", example: "We planted a tree in the garden.", part_of_speech: "noun" },
      { word: "Flower", meaning: "Hoa", phonetic: "/ˈflaʊər/", example: "The flowers bloom in spring.", part_of_speech: "noun" },
      { word: "River", meaning: "Sông", phonetic: "/ˈrɪvər/", example: "The river flows through the city.", part_of_speech: "noun" },
      { word: "Mountain", meaning: "Núi", phonetic: "/ˈmaʊntɪn/", example: "We climbed the mountain last weekend.", part_of_speech: "noun" },
      { word: "Forest", meaning: "Rừng", phonetic: "/ˈfɒrɪst/", example: "The forest is home to many animals.", part_of_speech: "noun" },
      { word: "Ocean", meaning: "Đại dương", phonetic: "/ˈoʊʃn/", example: "The Pacific Ocean is the largest.", part_of_speech: "noun" },
      { word: "Sunset", meaning: "Hoàng hôn", phonetic: "/ˈsʌnset/", example: "We watched the sunset at the beach.", part_of_speech: "noun" },
      { word: "Island", meaning: "Đảo", phonetic: "/ˈaɪlənd/", example: "Phu Quoc is a beautiful island.", part_of_speech: "noun" },
      { word: "Lake", meaning: "Hồ", phonetic: "/leɪk/", example: "We swam in the lake.", part_of_speech: "noun" },
    ],
    "House & Furniture": [
      { word: "Bedroom", meaning: "Phòng ngủ", phonetic: "/ˈbedruːm/", example: "My bedroom is on the second floor.", part_of_speech: "noun" },
      { word: "Kitchen", meaning: "Phòng bếp", phonetic: "/ˈkɪtʃɪn/", example: "She is cooking in the kitchen.", part_of_speech: "noun" },
      { word: "Bathroom", meaning: "Phòng tắm", phonetic: "/ˈbæθruːm/", example: "The bathroom is next to my room.", part_of_speech: "noun" },
      { word: "Living room", meaning: "Phòng khách", phonetic: "/ˈlɪvɪŋ ruːm/", example: "We watch TV in the living room.", part_of_speech: "noun" },
      { word: "Dining room", meaning: "Phòng ăn", phonetic: "/ˈdaɪnɪŋ ruːm/", example: "The family eats in the dining room.", part_of_speech: "noun" },
      { word: "Bed", meaning: "Giường", phonetic: "/bed/", example: "I go to bed at 10 PM.", part_of_speech: "noun" },
      { word: "Table", meaning: "Bàn", phonetic: "/ˈteɪbl/", example: "Put the books on the table.", part_of_speech: "noun" },
      { word: "Chair", meaning: "Ghế", phonetic: "/tʃeər/", example: "Pull up a chair and sit down.", part_of_speech: "noun" },
      { word: "Sofa", meaning: "Ghế sofa", phonetic: "/ˈsoʊfə/", example: "The sofa is very comfortable.", part_of_speech: "noun" },
      { word: "Bookshelf", meaning: "Kệ sách", phonetic: "/ˈbʊkʃelf/", example: "The bookshelf is full of books.", part_of_speech: "noun" },
      { word: "Wardrobe", meaning: "Tủ quần áo", phonetic: "/ˈwɔːrdroʊb/", example: "Hang your clothes in the wardrobe.", part_of_speech: "noun" },
      { word: "Lamp", meaning: "Đèn bàn", phonetic: "/læmp/", example: "Turn on the lamp to read.", part_of_speech: "noun" },
      { word: "Mirror", meaning: "Gương", phonetic: "/ˈmɪrər/", example: "She looked at herself in the mirror.", part_of_speech: "noun" },
      { word: "Curtain", meaning: "Rèm cửa", phonetic: "/ˈkɜːrtn/", example: "Open the curtains to let in light.", part_of_speech: "noun" },
      { word: "Carpet", meaning: "Thảm", phonetic: "/ˈkɑːrpɪt/", example: "The carpet matches the walls.", part_of_speech: "noun" },
    ],
    "Emotions & Feelings": [
      { word: "Happy", meaning: "Vui vẻ", phonetic: "/ˈhæpi/", example: "She feels happy when she sings.", part_of_speech: "adjective" },
      { word: "Sad", meaning: "Buồn", phonetic: "/sæd/", example: "He was sad when his friend moved away.", part_of_speech: "adjective" },
      { word: "Angry", meaning: "Tức giận", phonetic: "/ˈæŋɡri/", example: "The teacher was angry about the noise.", part_of_speech: "adjective" },
      { word: "Scared", meaning: "Sợ hãi", phonetic: "/skeərd/", example: "I am scared of spiders.", part_of_speech: "adjective" },
      { word: "Excited", meaning: "Hào hứng", phonetic: "/ɪkˈsaɪtɪd/", example: "The children are excited about the trip.", part_of_speech: "adjective" },
      { word: "Tired", meaning: "Mệt", phonetic: "/ˈtaɪərd/", example: "I am tired after a long day.", part_of_speech: "adjective" },
      { word: "Bored", meaning: "Chán", phonetic: "/bɔːrd/", example: "He was bored during the lecture.", part_of_speech: "adjective" },
      { word: "Surprised", meaning: "Ngạc nhiên", phonetic: "/sərˈpraɪzd/", example: "She was surprised by the gift.", part_of_speech: "adjective" },
      { word: "Nervous", meaning: "Lo lắng", phonetic: "/ˈnɜːrvəs/", example: "I feel nervous before exams.", part_of_speech: "adjective" },
      { word: "Proud", meaning: "Tự hào", phonetic: "/praʊd/", example: "Her parents are proud of her.", part_of_speech: "adjective" },
      { word: "Jealous", meaning: "Ghen tị", phonetic: "/ˈdʒeləs/", example: "He is jealous of his brother's success.", part_of_speech: "adjective" },
      { word: "Embarrassed", meaning: "Xấu hổ", phonetic: "/ɪmˈbærəst/", example: "I was embarrassed when I fell.", part_of_speech: "adjective" },
      { word: "Confident", meaning: "Tự tin", phonetic: "/ˈkɒnfɪdənt/", example: "She feels confident about the exam.", part_of_speech: "adjective" },
      { word: "Grateful", meaning: "Biết ơn", phonetic: "/ˈɡreɪtfl/", example: "I am grateful for your help.", part_of_speech: "adjective" },
      { word: "Lonely", meaning: "Cô đơn", phonetic: "/ˈloʊnli/", example: "He felt lonely in the big city.", part_of_speech: "adjective" },
    ],
    "School & Education": [
      { word: "Teacher", meaning: "Giáo viên", phonetic: "/ˈtiːtʃər/", example: "The teacher explains the lesson clearly.", part_of_speech: "noun" },
      { word: "Student", meaning: "Học sinh", phonetic: "/ˈstuːdnt/", example: "The students are studying for exams.", part_of_speech: "noun" },
      { word: "Classroom", meaning: "Lớp học", phonetic: "/ˈklæsruːm/", example: "The classroom has 30 desks.", part_of_speech: "noun" },
      { word: "Homework", meaning: "Bài tập về nhà", phonetic: "/ˈhoʊmwɜːrk/", example: "I have math homework tonight.", part_of_speech: "noun" },
      { word: "Exam", meaning: "Kỳ thi", phonetic: "/ɪɡˈzæm/", example: "The final exam is next week.", part_of_speech: "noun" },
      { word: "Library", meaning: "Thư viện", phonetic: "/ˈlaɪbreri/", example: "She studies in the library.", part_of_speech: "noun" },
      { word: "Lesson", meaning: "Bài học", phonetic: "/ˈlesn/", example: "Today's lesson is about grammar.", part_of_speech: "noun" },
      { word: "Schedule", meaning: "Thời khóa biểu", phonetic: "/ˈʃedjuːl/", example: "Check the schedule for tomorrow.", part_of_speech: "noun" },
      { word: "Diploma", meaning: "Bằng cấp", phonetic: "/dɪˈploʊmə/", example: "She received her diploma at graduation.", part_of_speech: "noun" },
      { word: "Scholarship", meaning: "Học bổng", phonetic: "/ˈskɒlərʃɪp/", example: "He won a scholarship to study abroad.", part_of_speech: "noun" },
      { word: "Subject", meaning: "Môn học", phonetic: "/ˈsʌbdʒɪkt/", example: "English is my favorite subject.", part_of_speech: "noun" },
      { word: "Notebook", meaning: "Vở ghi", phonetic: "/ˈnoʊtbʊk/", example: "Write the notes in your notebook.", part_of_speech: "noun" },
      { word: "Calculator", meaning: "Máy tính bỏ túi", phonetic: "/ˈkælkjuleɪtər/", example: "You need a calculator for math class.", part_of_speech: "noun" },
      { word: "Graduation", meaning: "Tốt nghiệp", phonetic: "/ˌɡrædʒuˈeɪʃn/", example: "Graduation day was very special.", part_of_speech: "noun" },
      { word: "Degree", meaning: "Bằng đại học", phonetic: "/dɪˈɡriː/", example: "She has a degree in computer science.", part_of_speech: "noun" },
    ],
    "Shopping & Money": [
      { word: "Price", meaning: "Giá", phonetic: "/praɪs/", example: "What is the price of this item?", part_of_speech: "noun" },
      { word: "Discount", meaning: "Giảm giá", phonetic: "/ˈdɪskaʊnt/", example: "There is a 20% discount this week.", part_of_speech: "noun" },
      { word: "Receipt", meaning: "Hóa đơn", phonetic: "/rɪˈsiːt/", example: "Keep your receipt in case you need to return it.", part_of_speech: "noun" },
      { word: "Change", meaning: "Tiền thừa", phonetic: "/tʃeɪndʒ/", example: "Here is your change, sir.", part_of_speech: "noun" },
      { word: "Cash", meaning: "Tiền mặt", phonetic: "/kæʃ/", example: "Do you pay by card or cash?", part_of_speech: "noun" },
      { word: "Credit card", meaning: "Thẻ tín dụng", phonetic: "/ˈkredɪt kɑːrd/", example: "I paid with my credit card.", part_of_speech: "noun" },
      { word: "Bargain", meaning: "Mặc cả", phonetic: "/ˈbɑːrɡən/", example: "I managed to bargain for a lower price.", part_of_speech: "verb" },
      { word: "Expensive", meaning: "Đắt", phonetic: "/ɪkˈspensɪv/", example: "This watch is too expensive.", part_of_speech: "adjective" },
      { word: "Cheap", meaning: "Rẻ", phonetic: "/tʃiːp/", example: "I found a cheap flight to Hanoi.", part_of_speech: "adjective" },
      { word: "Refund", meaning: "Hoàn tiền", phonetic: "/ˈriːfʌnd/", example: "I requested a refund for the damaged item.", part_of_speech: "noun" },
      { word: "Size", meaning: "Cỡ", phonetic: "/saɪz/", example: "This dress is not my size.", part_of_speech: "noun" },
      { word: "Try on", meaning: "Thử đồ", phonetic: "/traɪ ɒn/", example: "Can I try on this shirt?", part_of_speech: "phrasal verb" },
      { word: "Supermarket", meaning: "Siêu thị", phonetic: "/ˈsuːpərmɑːrkɪt/", example: "We buy groceries at the supermarket.", part_of_speech: "noun" },
      { word: "Customer", meaning: "Khách hàng", phonetic: "/ˈkʌstəmər/", example: "The customer is always right.", part_of_speech: "noun" },
      { word: "Checkout", meaning: "Quầy thanh toán", phonetic: "/ˈtʃekaʊt/", example: "Please go to the checkout to pay.", part_of_speech: "noun" },
    ],
  };

  for (const [topicName, words] of Object.entries(extraWords)) {
    const topicId = topicMap[topicName];
    if (!topicId) continue;
    for (const w of words) {
      db.run(
        "INSERT INTO vocabulary_words (topic_id, word, meaning, phonetic, example, part_of_speech) VALUES (?, ?, ?, ?, ?, ?)",
        [topicId, w.word, w.meaning, w.phonetic, w.example, w.part_of_speech]
      );
    }
  }

  // === EXTRA GRAMMAR LESSONS ===
  // Need to find the max existing order_index
  const maxOrderResult = db.exec("SELECT MAX(order_index) FROM grammar_lessons");
  let nextOrder = 25;
  if (maxOrderResult.length && maxOrderResult[0].values[0][0]) {
    nextOrder = (maxOrderResult[0].values[0][0] as number) + 1;
  }

  const extraGrammars = [
    {
      title: "Question Tags",
      content: `Question tags are short questions added to the end of a statement.
Used to confirm information or ask for agreement.

Structure:
• Positive statement → negative tag
  - You are tired, aren't you?
  - She works here, doesn't she?
  - They have finished, haven't they?

• Negative statement → positive tag
  - He isn't late, is he?
  - You don't like coffee, do you?
  - She hasn't arrived yet, has she?

Special cases:
• I am → aren't I? (I'm right, aren't I?)
• Let's → shall we? (Let's go, shall we?)
• Imperative → will/won't you? (Open the door, will you?)
• There is → isn't there? (There is a problem, isn't there?)

Intonation:
• Rising tone → asking for confirmation (unsure)
• Falling tone → expecting agreement (sure)`,
      level: "intermediate",
      category: "Grammar",
      order_index: nextOrder,
      examples: [
        { sentence: "You are a student, aren't you?", translation: "Bạn là học sinh, phải không?", explanation: "Positive statement → negative tag" },
        { sentence: "She doesn't like spicy food, does she?", translation: "Cô ấy không thích đồ cay, phải không?", explanation: "Negative statement → positive tag" },
        { sentence: "Let's go for a walk, shall we?", translation: "Chúng ta đi dạo nhé?", explanation: "Special: Let's → shall we" },
        { sentence: "I'm early today, aren't I?", translation: "Hôm nay tôi đến sớm, phải không?", explanation: "Special: I am → aren't I" },
      ]
    },
    {
      title: "Direct & Indirect Objects",
      content: `Verbs can have direct objects (DO) and indirect objects (IO).

Direct Object (DO): receives the action directly
• I bought a book. (What did I buy? → a book)
• She wrote a letter. (What did she write? → a letter)

Indirect Object (IO): receives the direct object
• I bought him a book. (For whom? → him)
• She wrote me a letter. (To whom? → me)

Word order patterns:
1. Verb + IO + DO (no preposition)
   • He gave his mother a present.
   • She sent her friend a postcard.

2. Verb + DO + to/for + IO
   • He gave a present to his mother.
   • She sent a postcard to her friend.

Common verbs with two objects:
• give, send, show, tell, offer, teach, lend, sell
• buy, make, get, cook, find, keep + for
• explain, describe, suggest + to (NOT: explain me → explain to me)

Pronoun order:
• When both objects are pronouns: V + DO + to/for + IO
  - I gave it to her. (NOT: I gave her it)`,
      level: "intermediate",
      category: "Grammar",
      order_index: nextOrder + 1,
      examples: [
        { sentence: "She gave her brother a gift.", translation: "Cô ấy đã tặng em trai một món quà.", explanation: "IO (her brother) + DO (a gift)" },
        { sentence: "He lent some money to his friend.", translation: "Anh ấy đã cho bạn mượn một ít tiền.", explanation: "DO + to + IO with 'lend'" },
        { sentence: "Can you explain this problem to me?", translation: "Bạn có thể giải thích vấn đề này cho tôi không?", explanation: "'Explain' always takes 'to' (not double object)" },
        { sentence: "She cooked a delicious meal for her family.", translation: "Cô ấy đã nấu một bữa ăn ngon cho gia đình.", explanation: "DO + for + IO with 'cook'" },
      ]
    },
    {
      title: "Word Order in English Sentences",
      content: `English follows a strict word order: Subject - Verb - Object - Place - Time (SVOMPT)

Basic structure:
Subject + Verb + Object + Manner + Place + Time
• I + met + my friend + unexpectedly + at the mall + yesterday.
• She + drives + her car + carefully + on the highway + every morning.

Adverb placement:
1. Before the main verb (for frequency adverbs)
   • I always wake up early.
   • She never eats meat.
   • They usually take the bus.

2. After 'be' verbs
   • He is always late.
   • They are never on time.

3. Between auxiliary and main verb
   • I have never been to Japan.
   • She will always love him.

Order of adjectives (before a noun):
Opinion → Size → Age → Shape → Color → Origin → Material → Purpose
• a beautiful (opinion) big (size) old (age) round (shape) brown (color) Italian (origin) leather (material) handbag
• a lovely small new wooden table

Inversion in questions:
• Yes/No: Auxiliary + Subject + V? (Do you like it?)
• Wh-: Wh-word + Aux + S + V? (Where do you live?)

Direct vs Indirect questions:
• Direct: Where is the station?
• Indirect: Could you tell me where the station is? (no inversion)`,
      level: "advanced",
      category: "Grammar",
      order_index: nextOrder + 2,
      examples: [
        { sentence: "She always arrives on time for meetings.", translation: "Cô ấy luôn đến đúng giờ cho các cuộc họp.", explanation: "Frequency adverb 'always' before main verb" },
        { sentence: "I have never seen such a beautiful sunset.", translation: "Tôi chưa bao giờ thấy hoàng hôn đẹp như vậy.", explanation: "'Never' after auxiliary 'have'" },
        { sentence: "He bought a lovely small old round wooden table.", translation: "Anh ấy đã mua một cái bàn gỗ tròn nhỏ cũ đáng yêu.", explanation: "Adjective order: opinion → size → age → shape → material" },
        { sentence: "Could you tell me where the post office is?", translation: "Bạn có thể chỉ tôi bưu điện ở đâu không?", explanation: "Indirect question: no inversion after 'where'" },
      ]
    },
  ];

  for (const g of extraGrammars) {
    db.run(
      "INSERT INTO grammar_lessons (title, content, level, category, order_index) VALUES (?, ?, ?, ?, ?)",
      [g.title, g.content, g.level, g.category, g.order_index]
    );
    const lessonIdResult = db.exec("SELECT last_insert_rowid()");
    const lessonId = lessonIdResult[0].values[0][0] as number;
    for (const ex of g.examples) {
      db.run(
        "INSERT INTO grammar_examples (lesson_id, sentence, translation, explanation) VALUES (?, ?, ?, ?)",
        [lessonId, ex.sentence, ex.translation, ex.explanation]
      );
    }
  }

  // === EXTRA EXERCISES ===
  // Get lesson IDs for new grammar lessons
  const newLessons = db.exec(
    "SELECT id FROM grammar_lessons WHERE title IN ('Question Tags', 'Direct & Indirect Objects', 'Word Order in English Sentences') ORDER BY order_index"
  );
  const newLessonIds: number[] = [];
  if (newLessons.length && newLessons[0].values.length) {
    for (const row of newLessons[0].values) {
      newLessonIds.push(row[0] as number);
    }
  }

  // Get max exercise ID
  const maxExResult = db.exec("SELECT MAX(id) FROM exercises");
  const nextExId = maxExResult[0].values[0][0] ? (maxExResult[0].values[0][0] as number) : 0;

  const extraExercises = [
    // Question Tags
    { lesson_id: newLessonIds[0], question: "You are a student, ___?", options: ["are you", "aren't you", "don't you", "do you"], correct_answer: "aren't you", explanation: "Positive statement → negative tag", difficulty: "intermediate" },
    { lesson_id: newLessonIds[0], question: "She doesn't like coffee, ___?", options: ["does she", "doesn't she", "is she", "isn't she"], correct_answer: "does she", explanation: "Negative statement → positive tag", difficulty: "intermediate" },
    { lesson_id: newLessonIds[0], question: "Let's go for a walk, ___?", options: ["will we", "shall we", "do we", "don't we"], correct_answer: "shall we", explanation: "'Let's' takes 'shall we' tag", difficulty: "intermediate" },
    { lesson_id: newLessonIds[0], question: "I'm early today, ___?", options: ["am I", "aren't I", "don't I", "isn't I"], correct_answer: "aren't I", explanation: "'I am' takes 'aren't I' tag", difficulty: "intermediate" },
    { lesson_id: newLessonIds[0], question: "They have finished their work, ___?", options: ["have they", "haven't they", "do they", "don't they"], correct_answer: "haven't they", explanation: "Present Perfect positive → negative tag with 'haven't'", difficulty: "intermediate" },

    // Direct & Indirect Objects
    { lesson_id: newLessonIds[1], question: "She gave ___ a present.", options: ["to him", "him", "for him", "his"], correct_answer: "him", explanation: "Verb + IO + DO (no preposition needed)", difficulty: "intermediate" },
    { lesson_id: newLessonIds[1], question: "He lent some money ___ his friend.", options: ["for", "to", "with", "Ø"], correct_answer: "to", explanation: "Verb + DO + to + IO with 'lend'", difficulty: "intermediate" },
    { lesson_id: newLessonIds[1], question: "Can you explain this problem ___ me?", options: ["for", "to", "with", "Ø"], correct_answer: "to", explanation: "'Explain' always takes 'to' before the indirect object", difficulty: "intermediate" },
    { lesson_id: newLessonIds[1], question: "She cooked a delicious meal ___ her family.", options: ["to", "for", "with", "Ø"], correct_answer: "for", explanation: "'Cook' takes 'for' before the indirect object", difficulty: "intermediate" },
    { lesson_id: newLessonIds[1], question: "I gave ___ to her yesterday.", options: ["it", "them", "him", "her"], correct_answer: "it", explanation: "When DO is a pronoun: V + DO + to/for + IO", difficulty: "intermediate" },

    // Word Order
    { lesson_id: newLessonIds[2], question: "Which sentence has correct word order?", options: ["She always is late.", "Always she is late.", "She is always late.", "She late always is."], correct_answer: "She is always late.", explanation: "Frequency adverb 'always' after 'be' verb", difficulty: "advanced" },
    { lesson_id: newLessonIds[2], question: "I met my friend ___ at the mall yesterday.", options: ["unexpectedly", "unexpected", "unexpectedly friend", "my friend unexpectedly"], correct_answer: "unexpectedly", explanation: "Adverb of manner goes after the object", difficulty: "advanced" },
    { lesson_id: newLessonIds[2], question: "Which is the correct adjective order?", options: ["a wooden round old table", "a round old wooden table", "a old round wooden table", "a wooden old round table"], correct_answer: "a round old wooden table", explanation: "Order: shape → age → material", difficulty: "advanced" },
    { lesson_id: newLessonIds[2], question: "Could you tell me where ___?", options: ["is the station", "the station is", "the station", "is station"], correct_answer: "the station is", explanation: "Indirect question: no inversion after 'where'", difficulty: "advanced" },
    { lesson_id: newLessonIds[2], question: "I have ___ been to Japan.", options: ["never", "always", "ever", "yet"], correct_answer: "never", explanation: "'Never' goes between auxiliary and main verb", difficulty: "advanced" },

    // Extra vocabulary exercises
    { lesson_type: "vocabulary", lesson_id: null, question: "'Shirt' in Vietnamese is ___?", options: ["Quần", "Áo sơ mi", "Váy", "Giày"], correct_answer: "Áo sơ mi", explanation: "'Shirt' means 'áo sơ mi'", difficulty: "beginner" },
    { lesson_type: "vocabulary", lesson_id: null, question: "What is the English word for 'mưa'?", options: ["Sunny", "Rainy", "Windy", "Cloudy"], correct_answer: "Rainy", explanation: "'Rainy' means 'mưa'", difficulty: "beginner" },
    { lesson_type: "vocabulary", lesson_id: null, question: "'Football' in Vietnamese is ___?", options: ["Bóng rổ", "Bóng đá", "Bóng chuyền", "Cầu lông"], correct_answer: "Bóng đá", explanation: "'Football' means 'bóng đá'", difficulty: "beginner" },
    { lesson_type: "vocabulary", lesson_id: null, question: "What does 'elephant' mean?", options: ["Hổ", "Voi", "Sư tử", "Hươu cao cổ"], correct_answer: "Voi", explanation: "'Elephant' means 'voi'", difficulty: "beginner" },
    { lesson_type: "vocabulary", lesson_id: null, question: "'Kitchen' means ___?", options: ["Phòng ngủ", "Phòng bếp", "Phòng tắm", "Phòng khách"], correct_answer: "Phòng bếp", explanation: "'Kitchen' means 'phòng bếp'", difficulty: "beginner" },
    { lesson_type: "vocabulary", lesson_id: null, question: "What is the opposite of 'happy'?", options: ["Excited", "Sad", "Angry", "Tired"], correct_answer: "Sad", explanation: "'Sad' is the opposite of 'happy'", difficulty: "beginner" },
    { lesson_type: "vocabulary", lesson_id: null, question: "'Teacher' in Vietnamese is ___?", options: ["Học sinh", "Giáo viên", "Bác sĩ", "Kỹ sư"], correct_answer: "Giáo viên", explanation: "'Teacher' means 'giáo viên'", difficulty: "beginner" },
    { lesson_type: "vocabulary", lesson_id: null, question: "'Discount' means ___?", options: ["Tăng giá", "Giảm giá", "Hoàn tiền", "Đổi trả"], correct_answer: "Giảm giá", explanation: "'Discount' means 'giảm giá'", difficulty: "intermediate" },
    { lesson_type: "vocabulary", lesson_id: null, question: "What is 'gardening'?", options: ["Làm vườn", "Làm bếp", "Đọc sách", "Vẽ tranh"], correct_answer: "Làm vườn", explanation: "'Gardening' means working in a garden", difficulty: "intermediate" },
    { lesson_type: "vocabulary", lesson_id: null, question: "'Embarrassed' means ___?", options: ["Tự tin", "Xấu hổ", "Ghen tị", "Lo lắng"], correct_answer: "Xấu hổ", explanation: "'Embarrassed' means feeling ashamed or shy", difficulty: "intermediate" },
    { lesson_type: "vocabulary", lesson_id: null, question: "'Scholarship' means ___?", options: ["Học phí", "Học bổng", "Bằng cấp", "Học kỳ"], correct_answer: "Học bổng", explanation: "'Scholarship' is financial aid for studies", difficulty: "intermediate" },
    { lesson_type: "vocabulary", lesson_id: null, question: "What does 'receipt' mean?", options: ["Hóa đơn", "Tiền thừa", "Giảm giá", "Khuyến mãi"], correct_answer: "Hóa đơn", explanation: "A 'receipt' is proof of payment", difficulty: "intermediate" },
  ];

  for (const ex of extraExercises) {
    db.run(
      "INSERT INTO exercises (lesson_type, lesson_id, question, options, correct_answer, explanation, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [ex.lesson_type || "grammar", ex.lesson_id, ex.question, JSON.stringify(ex.options), ex.correct_answer, ex.explanation, ex.difficulty]
    );
  }

  saveDb();
  console.log(`Added extra content: ${extraTopics.length} topics, 120 words, ${extraGrammars.length} lessons, ${extraExercises.length} exercises`);
}

async function start() {
  await initSchema();
  const db = await getDb();
  await migratePasswords();
  const users = db.exec("SELECT COUNT(*) as c FROM users");
  if (!users[0]?.values[0]?.[0]) {
    const { runSeed } = await import("./seed");
    await runSeed();
  }
  await addExtraContent();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EngZone running on http://localhost:${PORT} (LAN: http://192.168.1.x:${PORT})`);
  });
}

start();
