import bcrypt from "bcryptjs";
import { getDb, saveDb } from "./database";
import { initSchema } from "./schema";

export async function runSeed() {
  await seed();
}

export async function seedVocab() {
  const db = await getDb();
  db.run("DELETE FROM user_vocabulary");
  db.run("DELETE FROM vocabulary_words");
  db.run("DELETE FROM vocabulary_topics");
  await insertTopicsAndWords(db);
}

export async function seedStress() {
  const db = await getDb();
  db.run("DELETE FROM stress_examples");
  db.run("DELETE FROM stress_rules");
  await insertStressRules(db);
}

// === VOCABULARY TOPICS ===
const topics = [
  { name: "Greetings & Introductions", description: "Basic greetings, introductions, and polite expressions", level: "beginner", icon: "👋", order_index: 1 },
  { name: "Numbers & Time", description: "Numbers, dates, days, months, and telling time", level: "beginner", icon: "🔢", order_index: 2 },
  { name: "Family & People", description: "Family members, relationships, and describing people", level: "beginner", icon: "👨‍👩‍👧‍👦", order_index: 3 },
  { name: "Food & Drinks", description: "Common foods, drinks, and restaurant vocabulary", level: "beginner", icon: "🍕", order_index: 4 },
  { name: "Daily Routine", description: "Everyday activities and routines", level: "beginner", icon: "☀️", order_index: 5 },
  { name: "Travel & Directions", description: "Travel vocabulary, directions, and transportation", level: "intermediate", icon: "✈️", order_index: 6 },
  { name: "Work & Business", description: "Office vocabulary, business terms, and professional English", level: "intermediate", icon: "💼", order_index: 7 },
  { name: "Health & Medicine", description: "Medical terms, symptoms, and health vocabulary", level: "intermediate", icon: "🏥", order_index: 8 },
  { name: "Technology & Internet", description: "Tech terms, computer vocabulary, and internet language", level: "intermediate", icon: "💻", order_index: 9 },
  { name: "Academic Vocabulary", description: "Words for academic writing and university study", level: "advanced", icon: "📚", order_index: 10 },
  { name: "Business & Finance", description: "Advanced business and financial terminology", level: "advanced", icon: "📈", order_index: 11 },
  { name: "Science & Research", description: "Scientific terms and research vocabulary", level: "advanced", icon: "🔬", order_index: 12 },
  { name: "Literature & Arts", description: "Literary terms, art vocabulary, and criticism", level: "advanced", icon: "🎭", order_index: 13 },
  { name: "Law & Politics", description: "Legal terms, political vocabulary, and government", level: "advanced", icon: "⚖️", order_index: 14 },
  { name: "Electrical & Electronics Engineering", description: "Electrical engineering, circuits, electronics, and power systems", level: "advanced", icon: "⚡", order_index: 15 },
];

async function insertTopicsAndWords(db: any) {
  for (const t of topics) {
    db.run("INSERT INTO vocabulary_topics (name, description, level, icon, order_index) VALUES (?, ?, ?, ?, ?)",
      [t.name, t.description, t.level, t.icon, t.order_index]);
  }

  // === VOCABULARY WORDS ===
  const wordsByTopic: Record<string, Array<{ word: string; meaning: string; phonetic: string; example: string; part_of_speech: string }>> = {
    "Greetings & Introductions": [
      { word: "Hello", meaning: "Xin chào", phonetic: "/həˈloʊ/", example: "Hello, how are you today?", part_of_speech: "interjection" },
      { word: "Goodbye", meaning: "Tạm biệt", phonetic: "/ɡʊdˈbaɪ/", example: "Goodbye, see you tomorrow!", part_of_speech: "interjection" },
      { word: "Please", meaning: "Làm ơn", phonetic: "/pliːz/", example: "Please pass me the salt.", part_of_speech: "adverb" },
      { word: "Thank you", meaning: "Cảm ơn", phonetic: "/θæŋk juː/", example: "Thank you for your help.", part_of_speech: "phrase" },
      { word: "Nice to meet you", meaning: "Rất vui được gặp bạn", phonetic: "/naɪs tə miːt juː/", example: "Nice to meet you, I'm John.", part_of_speech: "phrase" },
      { word: "Excuse me", meaning: "Xin lỗi", phonetic: "/ɪkˈskjuːz miː/", example: "Excuse me, where is the station?", part_of_speech: "phrase" },
      { word: "How are you?", meaning: "Bạn khỏe không?", phonetic: "/haʊ ɑːr juː/", example: "How are you? I'm fine, thanks.", part_of_speech: "phrase" },
      { word: "Welcome", meaning: "Chào mừng", phonetic: "/ˈwelkəm/", example: "Welcome to our home!", part_of_speech: "interjection" },
      { word: "Sorry", meaning: "Xin lỗi", phonetic: "/ˈsɒri/", example: "I'm sorry for being late.", part_of_speech: "adjective" },
      { word: "Yes", meaning: "Vâng, có", phonetic: "/jes/", example: "Yes, I would like some tea.", part_of_speech: "adverb" },
      { word: "No", meaning: "Không", phonetic: "/noʊ/", example: "No, thank you, I'm full.", part_of_speech: "adverb" },
      { word: "See you later", meaning: "Hẹn gặp lại", phonetic: "/siː juː ˈleɪtər/", example: "See you later, have a nice day!", part_of_speech: "phrase" },
      { word: "Good morning", meaning: "Chào buổi sáng", phonetic: "/ɡʊd ˈmɔːrnɪŋ/", example: "Good morning, class!", part_of_speech: "phrase" },
      { word: "Good afternoon", meaning: "Chào buổi chiều", phonetic: "/ɡʊd ˌæftərˈnuːn/", example: "Good afternoon, may I help you?", part_of_speech: "phrase" },
      { word: "Good evening", meaning: "Chào buổi tối", phonetic: "/ɡʊd ˈiːvnɪŋ/", example: "Good evening, welcome to our restaurant.", part_of_speech: "phrase" },
      { word: "Good night", meaning: "Chúc ngủ ngon", phonetic: "/ɡʊd naɪt/", example: "Good night, sweet dreams!", part_of_speech: "phrase" },
      { word: "How do you do?", meaning: "Rất hân hạnh", phonetic: "/haʊ duː juː duː/", example: "How do you do? I'm pleased to meet you.", part_of_speech: "phrase" },
      { word: "Take care", meaning: "Bảo trọng", phonetic: "/teɪk keər/", example: "Take care and see you soon!", part_of_speech: "phrase" },
      { word: "Have a nice day", meaning: "Chúc một ngày tốt lành", phonetic: "/hæv ə naɪs deɪ/", example: "Thank you, have a nice day!", part_of_speech: "phrase" },
      { word: "What's your name?", meaning: "Bạn tên gì?", phonetic: "/wɒts jɔːr neɪm/", example: "What's your name? My name is Linh.", part_of_speech: "phrase" },
      { word: "My name is", meaning: "Tôi tên là", phonetic: "/maɪ neɪm ɪz/", example: "My name is John Smith.", part_of_speech: "phrase" },
      { word: "Pleased to meet you", meaning: "Rất vui được gặp bạn", phonetic: "/pliːzd tə miːt juː/", example: "Pleased to meet you, Ms. Lan.", part_of_speech: "phrase" },
    ],
    "Numbers & Time": [
      { word: "One", meaning: "Một", phonetic: "/wʌn/", example: "I have one book.", part_of_speech: "number" },
      { word: "Two", meaning: "Hai", phonetic: "/tuː/", example: "She has two cats.", part_of_speech: "number" },
      { word: "Three", meaning: "Ba", phonetic: "/θriː/", example: "There are three apples.", part_of_speech: "number" },
      { word: "First", meaning: "Đầu tiên", phonetic: "/fɜːrst/", example: "She was the first to arrive.", part_of_speech: "adjective" },
      { word: "Second", meaning: "Thứ hai", phonetic: "/ˈsekənd/", example: "This is my second cup of coffee.", part_of_speech: "adjective" },
      { word: "Today", meaning: "Hôm nay", phonetic: "/təˈdeɪ/", example: "Today is Monday.", part_of_speech: "noun" },
      { word: "Tomorrow", meaning: "Ngày mai", phonetic: "/təˈmɒroʊ/", example: "See you tomorrow!", part_of_speech: "noun" },
      { word: "Yesterday", meaning: "Hôm qua", phonetic: "/ˈjestərdeɪ/", example: "Yesterday was sunny.", part_of_speech: "noun" },
      { word: "Clock", meaning: "Đồng hồ", phonetic: "/klɒk/", example: "The clock shows 3 PM.", part_of_speech: "noun" },
      { word: "Hour", meaning: "Giờ", phonetic: "/ˈaʊər/", example: "I waited for an hour.", part_of_speech: "noun" },
      { word: "Minute", meaning: "Phút", phonetic: "/ˈmɪnɪt/", example: "The meeting starts in 10 minutes.", part_of_speech: "noun" },
      { word: "Day", meaning: "Ngày", phonetic: "/deɪ/", example: "There are 7 days in a week.", part_of_speech: "noun" },
      { word: "Week", meaning: "Tuần", phonetic: "/wiːk/", example: "I go to the gym twice a week.", part_of_speech: "noun" },
      { word: "Month", meaning: "Tháng", phonetic: "/mʌnθ/", example: "February is the shortest month.", part_of_speech: "noun" },
      { word: "Year", meaning: "Năm", phonetic: "/jɪər/", example: "A year has 12 months.", part_of_speech: "noun" },
      { word: "Quarter", meaning: "Một phần tư", phonetic: "/ˈkwɔːrtər/", example: "It's a quarter past three.", part_of_speech: "noun" },
      { word: "Half", meaning: "Một nửa", phonetic: "/hæf/", example: "I'll be there in half an hour.", part_of_speech: "noun" },
      { word: "Midnight", meaning: "Nửa đêm", phonetic: "/ˈmɪdnaɪt/", example: "The clock struck midnight.", part_of_speech: "noun" },
      { word: "Noon", meaning: "Buổi trưa", phonetic: "/nuːn/", example: "We have lunch at noon.", part_of_speech: "noun" },
      { word: "Century", meaning: "Thế kỷ", phonetic: "/ˈsentʃəri/", example: "The 21st century began in 2001.", part_of_speech: "noun" },
      { word: "Decade", meaning: "Thập kỷ", phonetic: "/ˈdekeɪd/", example: "A decade is ten years.", part_of_speech: "noun" },
      { word: "Date", meaning: "Ngày tháng", phonetic: "/deɪt/", example: "What's the date today?", part_of_speech: "noun" },
      { word: "Calendar", meaning: "Lịch", phonetic: "/ˈkælɪndər/", example: "Mark the date on your calendar.", part_of_speech: "noun" },
      { word: "Schedule", meaning: "Lịch trình", phonetic: "/ˈʃedjuːl/", example: "What's your schedule for tomorrow?", part_of_speech: "noun" },
      { word: "Moment", meaning: "Khoảnh khắc", phonetic: "/ˈmoʊmənt/", example: "Wait a moment, please.", part_of_speech: "noun" },
    ],
    "Family & People": [
      { word: "Mother", meaning: "Mẹ", phonetic: "/ˈmʌðər/", example: "My mother is a teacher.", part_of_speech: "noun" },
      { word: "Father", meaning: "Bố", phonetic: "/ˈfɑːðər/", example: "My father works in an office.", part_of_speech: "noun" },
      { word: "Brother", meaning: "Anh/em trai", phonetic: "/ˈbrʌðər/", example: "My brother is older than me.", part_of_speech: "noun" },
      { word: "Sister", meaning: "Chị/em gái", phonetic: "/ˈsɪstər/", example: "She is my younger sister.", part_of_speech: "noun" },
      { word: "Grandmother", meaning: "Bà", phonetic: "/ˈɡrænmʌðər/", example: "My grandmother makes great cookies.", part_of_speech: "noun" },
      { word: "Grandfather", meaning: "Ông", phonetic: "/ˈɡrænfɑːðər/", example: "My grandfather tells wonderful stories.", part_of_speech: "noun" },
      { word: "Husband", meaning: "Chồng", phonetic: "/ˈhʌzbənd/", example: "Her husband is a doctor.", part_of_speech: "noun" },
      { word: "Wife", meaning: "Vợ", phonetic: "/waɪf/", example: "His wife is a lawyer.", part_of_speech: "noun" },
      { word: "Friend", meaning: "Bạn", phonetic: "/frend/", example: "She is my best friend.", part_of_speech: "noun" },
      { word: "Neighbor", meaning: "Hàng xóm", phonetic: "/ˈneɪbər/", example: "Our neighbor is very friendly.", part_of_speech: "noun" },
      { word: "Colleague", meaning: "Đồng nghiệp", phonetic: "/ˈkɒliːɡ/", example: "I work with a nice colleague.", part_of_speech: "noun" },
      { word: "Child", meaning: "Đứa trẻ", phonetic: "/tʃaɪld/", example: "The child is playing in the park.", part_of_speech: "noun" },
      { word: "Adult", meaning: "Người lớn", phonetic: "/ˈædʌlt/", example: "Adults have more responsibilities.", part_of_speech: "noun" },
      { word: "Relative", meaning: "Họ hàng", phonetic: "/ˈrelətɪv/", example: "We visit our relatives during Tet.", part_of_speech: "noun" },
      { word: "Son", meaning: "Con trai", phonetic: "/sʌn/", example: "Their son is studying abroad.", part_of_speech: "noun" },
      { word: "Daughter", meaning: "Con gái", phonetic: "/ˈdɔːtər/", example: "My daughter loves drawing.", part_of_speech: "noun" },
      { word: "Parent", meaning: "Cha mẹ", phonetic: "/ˈpeərənt/", example: "Parents should spend time with their children.", part_of_speech: "noun" },
      { word: "Grandparent", meaning: "Ông bà", phonetic: "/ˈɡrænpeərənt/", example: "My grandparents live in the countryside.", part_of_speech: "noun" },
      { word: "Aunt", meaning: "Cô, dì", phonetic: "/ænt/", example: "My aunt brought me a gift.", part_of_speech: "noun" },
      { word: "Uncle", meaning: "Chú, bác", phonetic: "/ˈʌŋkl/", example: "My uncle is a police officer.", part_of_speech: "noun" },
      { word: "Cousin", meaning: "Anh/chị/em họ", phonetic: "/ˈkʌzn/", example: "My cousin is visiting from Hanoi.", part_of_speech: "noun" },
      { word: "Niece", meaning: "Cháu gái", phonetic: "/niːs/", example: "My niece just turned five.", part_of_speech: "noun" },
      { word: "Nephew", meaning: "Cháu trai", phonetic: "/ˈnefjuː/", example: "My nephew plays soccer well.", part_of_speech: "noun" },
      { word: "Sibling", meaning: "Anh chị em ruột", phonetic: "/ˈsɪblɪŋ/", example: "Do you have any siblings?", part_of_speech: "noun" },
    ],
    "Food & Drinks": [
      { word: "Rice", meaning: "Cơm, gạo", phonetic: "/raɪs/", example: "We eat rice every day.", part_of_speech: "noun" },
      { word: "Bread", meaning: "Bánh mì", phonetic: "/bred/", example: "I had bread with butter for breakfast.", part_of_speech: "noun" },
      { word: "Chicken", meaning: "Thịt gà", phonetic: "/ˈtʃɪkɪn/", example: "Grilled chicken is my favorite.", part_of_speech: "noun" },
      { word: "Fish", meaning: "Cá", phonetic: "/fɪʃ/", example: "We had fresh fish for dinner.", part_of_speech: "noun" },
      { word: "Vegetable", meaning: "Rau củ", phonetic: "/ˈvedʒtəbl/", example: "Eat more vegetables for good health.", part_of_speech: "noun" },
      { word: "Fruit", meaning: "Trái cây", phonetic: "/fruːt/", example: "I love eating fresh fruit.", part_of_speech: "noun" },
      { word: "Water", meaning: "Nước", phonetic: "/ˈwɔːtər/", example: "Please give me a glass of water.", part_of_speech: "noun" },
      { word: "Coffee", meaning: "Cà phê", phonetic: "/ˈkɒfi/", example: "I drink coffee every morning.", part_of_speech: "noun" },
      { word: "Tea", meaning: "Trà", phonetic: "/tiː/", example: "Would you like a cup of tea?", part_of_speech: "noun" },
      { word: "Milk", meaning: "Sữa", phonetic: "/mɪlk/", example: "Children should drink milk daily.", part_of_speech: "noun" },
      { word: "Egg", meaning: "Trứng", phonetic: "/eɡ/", example: "I had two eggs for breakfast.", part_of_speech: "noun" },
      { word: "Sugar", meaning: "Đường", phonetic: "/ˈʃʊɡər/", example: "Please add some sugar to my coffee.", part_of_speech: "noun" },
      { word: "Salt", meaning: "Muối", phonetic: "/sɔːlt/", example: "Don't put too much salt in the soup.", part_of_speech: "noun" },
      { word: "Restaurant", meaning: "Nhà hàng", phonetic: "/ˈrestərɒnt/", example: "We had dinner at a nice restaurant.", part_of_speech: "noun" },
      { word: "Delicious", meaning: "Ngon", phonetic: "/dɪˈlɪʃəs/", example: "This soup is delicious!", part_of_speech: "adjective" },
      { word: "Breakfast", meaning: "Bữa sáng", phonetic: "/ˈbrekfəst/", example: "I eat breakfast at 7 AM.", part_of_speech: "noun" },
      { word: "Lunch", meaning: "Bữa trưa", phonetic: "/lʌntʃ/", example: "We had lunch at a small café.", part_of_speech: "noun" },
      { word: "Dinner", meaning: "Bữa tối", phonetic: "/ˈdɪnər/", example: "Dinner is served at 7 PM.", part_of_speech: "noun" },
      { word: "Meat", meaning: "Thịt", phonetic: "/miːt/", example: "Do you eat meat or are you vegetarian?", part_of_speech: "noun" },
      { word: "Pork", meaning: "Thịt heo", phonetic: "/pɔːrk/", example: "Pork is commonly used in Vietnamese cuisine.", part_of_speech: "noun" },
      { word: "Beef", meaning: "Thịt bò", phonetic: "/biːf/", example: "I'd like a beef noodle soup.", part_of_speech: "noun" },
      { word: "Shrimp", meaning: "Tôm", phonetic: "/ʃrɪmp/", example: "The shrimp was grilled perfectly.", part_of_speech: "noun" },
      { word: "Noodle", meaning: "Mì, bún, phở", phonetic: "/ˈnuːdl/", example: "Vietnamese noodle soup is world-famous.", part_of_speech: "noun" },
      { word: "Soup", meaning: "Súp, canh", phonetic: "/suːp/", example: "The soup is hot and delicious.", part_of_speech: "noun" },
      { word: "Sauce", meaning: "Nước sốt", phonetic: "/sɔːs/", example: "This sauce is made from fish sauce.", part_of_speech: "noun" },
      { word: "Spicy", meaning: "Cay", phonetic: "/ˈspaɪsi/", example: "Vietnamese food can be very spicy.", part_of_speech: "adjective" },
    ],
    "Daily Routine": [
      { word: "Wake up", meaning: "Thức dậy", phonetic: "/weɪk ʌp/", example: "I wake up at 6 AM every day.", part_of_speech: "phrasal verb" },
      { word: "Get dressed", meaning: "Mặc quần áo", phonetic: "/ɡet drest/", example: "She gets dressed before breakfast.", part_of_speech: "phrase" },
      { word: "Brush teeth", meaning: "Đánh răng", phonetic: "/brʌʃ tiːθ/", example: "Brush your teeth twice a day.", part_of_speech: "phrase" },
      { word: "Take a shower", meaning: "Tắm", phonetic: "/teɪk ə ˈʃaʊər/", example: "I take a shower every morning.", part_of_speech: "phrase" },
      { word: "Have breakfast", meaning: "Ăn sáng", phonetic: "/hæv ˈbrekfəst/", example: "I have breakfast at 7 AM.", part_of_speech: "phrase" },
      { word: "Go to work", meaning: "Đi làm", phonetic: "/ɡoʊ tə wɜːrk/", example: "He goes to work by bus.", part_of_speech: "phrase" },
      { word: "Study", meaning: "Học", phonetic: "/ˈstʌdi/", example: "I study English every evening.", part_of_speech: "verb" },
      { word: "Cook", meaning: "Nấu ăn", phonetic: "/kʊk/", example: "She cooks dinner for the family.", part_of_speech: "verb" },
      { word: "Clean", meaning: "Dọn dẹp", phonetic: "/kliːn/", example: "I clean my room on weekends.", part_of_speech: "verb" },
      { word: "Watch TV", meaning: "Xem TV", phonetic: "/wɒtʃ tiː viː/", example: "We watch TV after dinner.", part_of_speech: "phrase" },
      { word: "Go to bed", meaning: "Đi ngủ", phonetic: "/ɡoʊ tə bed/", example: "I go to bed at 10 PM.", part_of_speech: "phrase" },
      { word: "Exercise", meaning: "Tập thể dục", phonetic: "/ˈeksərsaɪz/", example: "I exercise for 30 minutes daily.", part_of_speech: "verb" },
      { word: "Read", meaning: "Đọc", phonetic: "/riːd/", example: "I like to read books before sleeping.", part_of_speech: "verb" },
      { word: "Work", meaning: "Làm việc", phonetic: "/wɜːrk/", example: "She works from 9 AM to 5 PM.", part_of_speech: "verb" },
      { word: "Have lunch", meaning: "Ăn trưa", phonetic: "/hæv lʌntʃ/", example: "We have lunch at the office.", part_of_speech: "phrase" },
      { word: "Have dinner", meaning: "Ăn tối", phonetic: "/hæv ˈdɪnər/", example: "They have dinner together every evening.", part_of_speech: "phrase" },
      { word: "Take a break", meaning: "Nghỉ giải lao", phonetic: "/teɪk ə breɪk/", example: "Let's take a break for 15 minutes.", part_of_speech: "phrase" },
      { word: "Get home", meaning: "Về nhà", phonetic: "/ɡet hoʊm/", example: "I get home at 6 PM every day.", part_of_speech: "phrase" },
      { word: "Stay up late", meaning: "Thức khuya", phonetic: "/steɪ ʌp leɪt/", example: "I stayed up late to finish my homework.", part_of_speech: "phrase" },
      { word: "Make the bed", meaning: "Dọn giường", phonetic: "/meɪk ðə bed/", example: "Please make your bed after waking up.", part_of_speech: "phrase" },
      { word: "Set an alarm", meaning: "Đặt báo thức", phonetic: "/set ən əˈlɑːrm/", example: "I set an alarm for 6 AM.", part_of_speech: "phrase" },
      { word: "Do homework", meaning: "Làm bài tập", phonetic: "/duː ˈhoʊmwɜːrk/", example: "The children do homework after school.", part_of_speech: "phrase" },
      { word: "Take out the trash", meaning: "Đổ rác", phonetic: "/teɪk aʊt ðə træʃ/", example: "Don't forget to take out the trash.", part_of_speech: "phrase" },
      { word: "Water the plants", meaning: "Tưới cây", phonetic: "/ˈwɔːtər ðə plænts/", example: "I water the plants every morning.", part_of_speech: "phrase" },
    ],
    "Travel & Directions": [
      { word: "Airport", meaning: "Sân bay", phonetic: "/ˈeərpɔːrt/", example: "We arrived at the airport at 7 AM.", part_of_speech: "noun" },
      { word: "Hotel", meaning: "Khách sạn", phonetic: "/hoʊˈtel/", example: "We stayed at a five-star hotel.", part_of_speech: "noun" },
      { word: "Ticket", meaning: "Vé", phonetic: "/ˈtɪkɪt/", example: "I bought a ticket to Hanoi.", part_of_speech: "noun" },
      { word: "Passport", meaning: "Hộ chiếu", phonetic: "/ˈpæspɔːrt/", example: "Don't forget your passport!", part_of_speech: "noun" },
      { word: "Luggage", meaning: "Hành lý", phonetic: "/ˈlʌɡɪdʒ/", example: "My luggage was lost at the airport.", part_of_speech: "noun" },
      { word: "Map", meaning: "Bản đồ", phonetic: "/mæp/", example: "Let's look at the map to find the way.", part_of_speech: "noun" },
      { word: "Train station", meaning: "Ga tàu", phonetic: "/treɪn ˈsteɪʃn/", example: "The train station is near the city center.", part_of_speech: "noun" },
      { word: "Bus stop", meaning: "Trạm xe buýt", phonetic: "/bʌs stɒp/", example: "Wait for me at the bus stop.", part_of_speech: "noun" },
      { word: "Turn left", meaning: "Rẽ trái", phonetic: "/tɜːrn left/", example: "Turn left at the traffic light.", part_of_speech: "phrase" },
      { word: "Turn right", meaning: "Rẽ phải", phonetic: "/tɜːrn raɪt/", example: "Turn right after the bank.", part_of_speech: "phrase" },
      { word: "Go straight", meaning: "Đi thẳng", phonetic: "/ɡoʊ streɪt/", example: "Go straight for two blocks.", part_of_speech: "phrase" },
      { word: "Reservation", meaning: "Đặt chỗ", phonetic: "/ˌrezərˈveɪʃn/", example: "I have a reservation under the name Smith.", part_of_speech: "noun" },
      { word: "Sightseeing", meaning: "Tham quan", phonetic: "/ˈsaɪtsiːɪŋ/", example: "We went sightseeing around the old town.", part_of_speech: "noun" },
      { word: "Suitcase", meaning: "Va li", phonetic: "/ˈsuːtkeɪs/", example: "I packed my suitcase last night.", part_of_speech: "noun" },
      { word: "Departure", meaning: "Khởi hành", phonetic: "/dɪˈpɑːrtʃər/", example: "The departure time is 8 AM.", part_of_speech: "noun" },
      { word: "Arrival", meaning: "Đến nơi", phonetic: "/əˈraɪvl/", example: "Our arrival is scheduled for 10 PM.", part_of_speech: "noun" },
      { word: "Terminal", meaning: "Nhà ga", phonetic: "/ˈtɜːrmɪnl/", example: "Please proceed to terminal 2.", part_of_speech: "noun" },
      { word: "Boarding pass", meaning: "Thẻ lên máy bay", phonetic: "/ˈbɔːrdɪŋ pæs/", example: "Please show your boarding pass.", part_of_speech: "noun" },
      { word: "Visa", meaning: "Thị thực", phonetic: "/ˈviːzə/", example: "I applied for a tourist visa.", part_of_speech: "noun" },
      { word: "Customs", meaning: "Hải quan", phonetic: "/ˈkʌstəmz/", example: "We went through customs at the airport.", part_of_speech: "noun" },
      { word: "Tour guide", meaning: "Hướng dẫn viên", phonetic: "/tʊər ɡaɪd/", example: "The tour guide spoke excellent English.", part_of_speech: "noun" },
      { word: "Souvenir", meaning: "Quà lưu niệm", phonetic: "/ˌsuːvəˈnɪr/", example: "I bought souvenirs for my family.", part_of_speech: "noun" },
      { word: "Itinerary", meaning: "Hành trình", phonetic: "/aɪˈtɪnəreri/", example: "Our itinerary includes three cities.", part_of_speech: "noun" },
      { word: "Round trip", meaning: "Khứ hồi", phonetic: "/raʊnd trɪp/", example: "I booked a round trip ticket.", part_of_speech: "noun" },
    ],
    "Work & Business": [
      { word: "Office", meaning: "Văn phòng", phonetic: "/ˈɒfɪs/", example: "I work in a large office building.", part_of_speech: "noun" },
      { word: "Meeting", meaning: "Cuộc họp", phonetic: "/ˈmiːtɪŋ/", example: "We have a meeting at 2 PM.", part_of_speech: "noun" },
      { word: "Interview", meaning: "Phỏng vấn", phonetic: "/ˈɪntərvjuː/", example: "I have a job interview tomorrow.", part_of_speech: "noun" },
      { word: "Resume", meaning: "Sơ yếu lý lịch", phonetic: "/ˈrezəmeɪ/", example: "Please send your resume to HR.", part_of_speech: "noun" },
      { word: "Salary", meaning: "Lương", phonetic: "/ˈsæləri/", example: "The salary for this position is competitive.", part_of_speech: "noun" },
      { word: "Employee", meaning: "Nhân viên", phonetic: "/ɪmˈplɔɪiː/", example: "The company has 500 employees.", part_of_speech: "noun" },
      { word: "Employer", meaning: "Người sử dụng lao động", phonetic: "/ɪmˈplɔɪər/", example: "My employer offers health insurance.", part_of_speech: "noun" },
      { word: "Deadline", meaning: "Hạn chót", phonetic: "/ˈdedlaɪn/", example: "The deadline for the project is Friday.", part_of_speech: "noun" },
      { word: "Contract", meaning: "Hợp đồng", phonetic: "/ˈkɒntrækt/", example: "I signed a one-year contract.", part_of_speech: "noun" },
      { word: "Promotion", meaning: "Thăng chức", phonetic: "/prəˈmoʊʃn/", example: "She got a promotion after two years.", part_of_speech: "noun" },
      { word: "Negotiate", meaning: "Đàm phán", phonetic: "/nɪˈɡoʊʃieɪt/", example: "We need to negotiate the terms.", part_of_speech: "verb" },
      { word: "Manager", meaning: "Quản lý", phonetic: "/ˈmænɪdʒər/", example: "The manager approved my vacation request.", part_of_speech: "noun" },
      { word: "Presentation", meaning: "Bài thuyết trình", phonetic: "/ˌpreznˈteɪʃn/", example: "I gave a presentation to the board.", part_of_speech: "noun" },
      { word: "Colleague", meaning: "Đồng nghiệp", phonetic: "/ˈkɒliːɡ/", example: "My colleague helped me with the report.", part_of_speech: "noun" },
      { word: "Boss", meaning: "Sếp", phonetic: "/bɒs/", example: "My boss approved my leave request.", part_of_speech: "noun" },
      { word: "Team", meaning: "Nhóm", phonetic: "/tiːm/", example: "Our team works well together.", part_of_speech: "noun" },
      { word: "Task", meaning: "Nhiệm vụ", phonetic: "/tæsk/", example: "I have many tasks to complete today.", part_of_speech: "noun" },
      { word: "Project", meaning: "Dự án", phonetic: "/ˈprɒdʒekt/", example: "The project deadline is next month.", part_of_speech: "noun" },
      { word: "Client", meaning: "Khách hàng", phonetic: "/ˈklaɪənt/", example: "The client was satisfied with our work.", part_of_speech: "noun" },
      { word: "Invoice", meaning: "Hóa đơn", phonetic: "/ˈɪnvɔɪs/", example: "Please send the invoice to our accounting department.", part_of_speech: "noun" },
      { word: "Strategy", meaning: "Chiến lược", phonetic: "/ˈstrætədʒi/", example: "We need a new marketing strategy.", part_of_speech: "noun" },
      { word: "Overtime", meaning: "Làm thêm giờ", phonetic: "/ˈoʊvərtaɪm/", example: "I worked overtime to finish the report.", part_of_speech: "noun" },
      { word: "Business trip", meaning: "Chuyến công tác", phonetic: "/ˈbɪznəs trɪp/", example: "He is on a business trip to Singapore.", part_of_speech: "noun" },
      { word: "Workplace", meaning: "Nơi làm việc", phonetic: "/ˈwɜːrkpleɪs/", example: "Our workplace has a friendly atmosphere.", part_of_speech: "noun" },
    ],
    "Health & Medicine": [
      { word: "Doctor", meaning: "Bác sĩ", phonetic: "/ˈdɒktər/", example: "The doctor prescribed me some medicine.", part_of_speech: "noun" },
      { word: "Nurse", meaning: "Y tá", phonetic: "/nɜːrs/", example: "The nurse took my temperature.", part_of_speech: "noun" },
      { word: "Hospital", meaning: "Bệnh viện", phonetic: "/ˈhɒspɪtl/", example: "He was taken to the hospital.", part_of_speech: "noun" },
      { word: "Medicine", meaning: "Thuốc", phonetic: "/ˈmedɪsn/", example: "Take this medicine three times a day.", part_of_speech: "noun" },
      { word: "Headache", meaning: "Đau đầu", phonetic: "/ˈhedeɪk/", example: "I have a terrible headache.", part_of_speech: "noun" },
      { word: "Fever", meaning: "Sốt", phonetic: "/ˈfiːvər/", example: "She has a high fever.", part_of_speech: "noun" },
      { word: "Cough", meaning: "Ho", phonetic: "/kɒf/", example: "He has a bad cough.", part_of_speech: "noun" },
      { word: "Pain", meaning: "Đau", phonetic: "/peɪn/", example: "I feel a sharp pain in my back.", part_of_speech: "noun" },
      { word: "Symptom", meaning: "Triệu chứng", phonetic: "/ˈsɪmptəm/", example: "Common symptoms include fever and cough.", part_of_speech: "noun" },
      { word: "Vaccine", meaning: "Vắc xin", phonetic: "/ˈvæksiːn/", example: "The vaccine prevents many diseases.", part_of_speech: "noun" },
      { word: "Surgery", meaning: "Phẫu thuật", phonetic: "/ˈsɜːrdʒəri/", example: "He needs surgery on his knee.", part_of_speech: "noun" },
      { word: "Prescription", meaning: "Đơn thuốc", phonetic: "/prɪˈskrɪpʃn/", example: "The doctor gave me a prescription.", part_of_speech: "noun" },
      { word: "Emergency", meaning: "Cấp cứu", phonetic: "/iˈmɜːrdʒənsi/", example: "Call the emergency room immediately!", part_of_speech: "noun" },
      { word: "Pharmacy", meaning: "Hiệu thuốc", phonetic: "/ˈfɑːrməsi/", example: "You can buy this at any pharmacy.", part_of_speech: "noun" },
      { word: "Check-up", meaning: "Kiểm tra sức khỏe", phonetic: "/tʃek ʌp/", example: "I have a check-up next week.", part_of_speech: "noun" },
      { word: "Appointment", meaning: "Cuộc hẹn", phonetic: "/əˈpɔɪntmənt/", example: "I have a doctor's appointment at 3 PM.", part_of_speech: "noun" },
      { word: "Diagnosis", meaning: "Chẩn đoán", phonetic: "/ˌdaɪəɡˈnoʊsɪs/", example: "The diagnosis was a common cold.", part_of_speech: "noun" },
      { word: "Treatment", meaning: "Điều trị", phonetic: "/ˈtriːtmənt/", example: "The treatment lasts for two weeks.", part_of_speech: "noun" },
      { word: "Recovery", meaning: "Hồi phục", phonetic: "/rɪˈkʌvəri/", example: "Her recovery was faster than expected.", part_of_speech: "noun" },
      { word: "Injection", meaning: "Tiêm", phonetic: "/ɪnˈdʒekʃn/", example: "The nurse gave me an injection.", part_of_speech: "noun" },
      { word: "Ambulance", meaning: "Xe cứu thương", phonetic: "/ˈæmbjələns/", example: "Call an ambulance, it's an emergency!", part_of_speech: "noun" },
      { word: "Thermometer", meaning: "Nhiệt kế", phonetic: "/θərˈmɒmɪtər/", example: "The thermometer shows 38 degrees.", part_of_speech: "noun" },
      { word: "Clinic", meaning: "Phòng khám", phonetic: "/ˈklɪnɪk/", example: "The clinic opens at 8 AM.", part_of_speech: "noun" },
      { word: "Ward", meaning: "Phòng bệnh", phonetic: "/wɔːrd/", example: "He was moved to the general ward.", part_of_speech: "noun" },
      { word: "Allergy", meaning: "Dị ứng", phonetic: "/ˈælərdʒi/", example: "I have an allergy to seafood.", part_of_speech: "noun" },
    ],
    "Technology & Internet": [
      { word: "Computer", meaning: "Máy tính", phonetic: "/kəmˈpjuːtər/", example: "I use my computer for work.", part_of_speech: "noun" },
      { word: "Internet", meaning: "Internet", phonetic: "/ˈɪntərnet/", example: "The internet connection is very fast.", part_of_speech: "noun" },
      { word: "Website", meaning: "Trang web", phonetic: "/ˈwebsaɪt/", example: "Our website was updated yesterday.", part_of_speech: "noun" },
      { word: "Software", meaning: "Phần mềm", phonetic: "/ˈsɒftweər/", example: "This software helps with video editing.", part_of_speech: "noun" },
      { word: "Hardware", meaning: "Phần cứng", phonetic: "/ˈhɑːrdweər/", example: "The hardware needs to be upgraded.", part_of_speech: "noun" },
      { word: "Password", meaning: "Mật khẩu", phonetic: "/ˈpæswɜːrd/", example: "Please choose a strong password.", part_of_speech: "noun" },
      { word: "Database", meaning: "Cơ sở dữ liệu", phonetic: "/ˈdeɪtəbeɪs/", example: "The database stores all user information.", part_of_speech: "noun" },
      { word: "Download", meaning: "Tải xuống", phonetic: "/ˌdaʊnˈloʊd/", example: "Download the file from the website.", part_of_speech: "verb" },
      { word: "Upload", meaning: "Tải lên", phonetic: "/ˌʌpˈloʊd/", example: "Please upload your photos here.", part_of_speech: "verb" },
      { word: "Server", meaning: "Máy chủ", phonetic: "/ˈsɜːrvər/", example: "The server is down for maintenance.", part_of_speech: "noun" },
      { word: "Network", meaning: "Mạng", phonetic: "/ˈnetwɜːrk/", example: "The office network is secure.", part_of_speech: "noun" },
      { word: "Email", meaning: "Thư điện tử", phonetic: "/ˈiːmeɪl/", example: "I will send you an email.", part_of_speech: "noun" },
      { word: "Application", meaning: "Ứng dụng", phonetic: "/ˌæplɪˈkeɪʃn/", example: "This application helps you learn English.", part_of_speech: "noun" },
      { word: "Artificial Intelligence", meaning: "Trí tuệ nhân tạo", phonetic: "/ˌɑːrtɪˈfɪʃl ɪnˈtelɪdʒəns/", example: "AI is transforming many industries.", part_of_speech: "noun" },
      { word: "Cybersecurity", meaning: "An ninh mạng", phonetic: "/ˌsaɪbərsɪˈkjʊərəti/", example: "Cybersecurity is essential for all businesses.", part_of_speech: "noun" },
      { word: "Algorithm", meaning: "Thuật toán", phonetic: "/ˈælɡərɪðəm/", example: "The algorithm sorts data efficiently.", part_of_speech: "noun" },
      { word: "Bandwidth", meaning: "Băng thông", phonetic: "/ˈbændwɪdθ/", example: "The bandwidth is sufficient for video streaming.", part_of_speech: "noun" },
      { word: "Encryption", meaning: "Mã hóa", phonetic: "/ɪnˈkrɪpʃn/", example: "Encryption protects sensitive data.", part_of_speech: "noun" },
      { word: "Firewall", meaning: "Tường lửa", phonetic: "/ˈfaɪərwɔːl/", example: "The firewall blocks unauthorized access.", part_of_speech: "noun" },
      { word: "Protocol", meaning: "Giao thức", phonetic: "/ˈproʊtəkɒl/", example: "HTTP is a web communication protocol.", part_of_speech: "noun" },
      { word: "Router", meaning: "Bộ định tuyến", phonetic: "/ˈruːtər/", example: "The router connects our devices to the internet.", part_of_speech: "noun" },
      { word: "Cache", meaning: "Bộ nhớ đệm", phonetic: "/kæʃ/", example: "Clear your browser cache to fix the issue.", part_of_speech: "noun" },
      { word: "Backup", meaning: "Sao lưu", phonetic: "/ˈbækʌp/", example: "Always keep a backup of your important files.", part_of_speech: "noun" },
      { word: "Cloud", meaning: "Đám mây", phonetic: "/klaʊd/", example: "Our data is stored on the cloud.", part_of_speech: "noun" },
      { word: "Browser", meaning: "Trình duyệt", phonetic: "/ˈbraʊzər/", example: "Which browser do you use?", part_of_speech: "noun" },
    ],
    "Academic Vocabulary": [
      { word: "Analyze", meaning: "Phân tích", phonetic: "/ˈænəlaɪz/", example: "We need to analyze the data carefully.", part_of_speech: "verb" },
      { word: "Hypothesis", meaning: "Giả thuyết", phonetic: "/haɪˈpɒθəsɪs/", example: "The hypothesis was tested in the experiment.", part_of_speech: "noun" },
      { word: "Methodology", meaning: "Phương pháp luận", phonetic: "/ˌmeθəˈdɒlədʒi/", example: "The research methodology was rigorous.", part_of_speech: "noun" },
      { word: "Significant", meaning: "Đáng kể, quan trọng", phonetic: "/sɪɡˈnɪfɪkənt/", example: "There was a significant increase in sales.", part_of_speech: "adjective" },
      { word: "Theoretical", meaning: "Thuộc lý thuyết", phonetic: "/ˌθɪəˈretɪkl/", example: "The theoretical framework is well-established.", part_of_speech: "adjective" },
      { word: "Empirical", meaning: "Thực nghiệm", phonetic: "/ɪmˈpɪrɪkl/", example: "Empirical evidence supports this claim.", part_of_speech: "adjective" },
      { word: "Paradigm", meaning: "Mô hình, hệ hình", phonetic: "/ˈpærədaɪm/", example: "This discovery shifted the scientific paradigm.", part_of_speech: "noun" },
      { word: "Synthesize", meaning: "Tổng hợp", phonetic: "/ˈsɪnθəsaɪz/", example: "The paper synthesizes findings from multiple studies.", part_of_speech: "verb" },
      { word: "Abstract", meaning: "Tóm tắt, trừu tượng", phonetic: "/ˈæbstrækt/", example: "The abstract summarizes the entire paper.", part_of_speech: "noun" },
      { word: "Cite", meaning: "Trích dẫn", phonetic: "/saɪt/", example: "Please cite your sources properly.", part_of_speech: "verb" },
      { word: "Conclusion", meaning: "Kết luận", phonetic: "/kənˈkluːʒn/", example: "The conclusion answers the research question.", part_of_speech: "noun" },
      { word: "Critique", meaning: "Phê bình", phonetic: "/krɪˈtiːk/", example: "The professor wrote a critique of the article.", part_of_speech: "noun" },
      { word: "Discourse", meaning: "Diễn ngôn", phonetic: "/ˈdɪskɔːrs/", example: "Academic discourse follows specific conventions.", part_of_speech: "noun" },
      { word: "Plagiarism", meaning: "Đạo văn", phonetic: "/ˈpleɪdʒərɪzəm/", example: "Plagiarism is a serious academic offense.", part_of_speech: "noun" },
      { word: "Peer review", meaning: "Bình duyệt", phonetic: "/pɪər rɪˈvjuː/", example: "The article went through peer review.", part_of_speech: "noun" },
      { word: "Curriculum", meaning: "Chương trình giảng dạy", phonetic: "/kəˈrɪkjʊləm/", example: "The curriculum includes both theory and practice.", part_of_speech: "noun" },
      { word: "Dissertation", meaning: "Luận án", phonetic: "/ˌdɪsərˈteɪʃn/", example: "She is writing her doctoral dissertation.", part_of_speech: "noun" },
      { word: "Thesis", meaning: "Luận văn", phonetic: "/ˈθiːsɪs/", example: "His thesis was on renewable energy.", part_of_speech: "noun" },
      { word: "Seminar", meaning: "Hội thảo", phonetic: "/ˈsemɪnɑːr/", example: "The seminar attracted many researchers.", part_of_speech: "noun" },
      { word: "Lecture", meaning: "Bài giảng", phonetic: "/ˈlektʃər/", example: "The lecture on AI was fascinating.", part_of_speech: "noun" },
      { word: "Assignment", meaning: "Bài tập", phonetic: "/əˈsaɪnmənt/", example: "The assignment is due next Friday.", part_of_speech: "noun" },
      { word: "Assessment", meaning: "Đánh giá", phonetic: "/əˈsesmənt/", example: "The assessment includes a final exam.", part_of_speech: "noun" },
      { word: "Scholarship", meaning: "Học bổng", phonetic: "/ˈskɒlərʃɪp/", example: "She won a scholarship to study abroad.", part_of_speech: "noun" },
      { word: "Tuition", meaning: "Học phí", phonetic: "/tjuˈɪʃn/", example: "The tuition fee is due at the start of the term.", part_of_speech: "noun" },
      { word: "Plagiarize", meaning: "Đạo văn", phonetic: "/ˈpleɪdʒəraɪz/", example: "Students should never plagiarize.", part_of_speech: "verb" },
    ],
    "Business & Finance": [
      { word: "Revenue", meaning: "Doanh thu", phonetic: "/ˈrevənjuː/", example: "The company's revenue increased by 20%.", part_of_speech: "noun" },
      { word: "Profit", meaning: "Lợi nhuận", phonetic: "/ˈprɒfɪt/", example: "The business made a good profit this year.", part_of_speech: "noun" },
      { word: "Investment", meaning: "Đầu tư", phonetic: "/ɪnˈvestmənt/", example: "This investment has high returns.", part_of_speech: "noun" },
      { word: "Stock", meaning: "Cổ phiếu", phonetic: "/stɒk/", example: "The stock price went up today.", part_of_speech: "noun" },
      { word: "Market", meaning: "Thị trường", phonetic: "/ˈmɑːrkɪt/", example: "The housing market is very competitive.", part_of_speech: "noun" },
      { word: "Budget", meaning: "Ngân sách", phonetic: "/ˈbʌdʒɪt/", example: "We need to stay within budget.", part_of_speech: "noun" },
      { word: "Loan", meaning: "Khoản vay", phonetic: "/loʊn/", example: "The bank approved my loan application.", part_of_speech: "noun" },
      { word: "Interest rate", meaning: "Lãi suất", phonetic: "/ˈɪntrəst reɪt/", example: "The interest rate is 5% per year.", part_of_speech: "noun" },
      { word: "Asset", meaning: "Tài sản", phonetic: "/ˈæset/", example: "The company has total assets of $10 million.", part_of_speech: "noun" },
      { word: "Liability", meaning: "Nợ phải trả", phonetic: "/ˌlaɪəˈbɪləti/", example: "Liabilities include loans and accounts payable.", part_of_speech: "noun" },
      { word: "Dividend", meaning: "Cổ tức", phonetic: "/ˈdɪvɪdend/", example: "Shareholders received a dividend payment.", part_of_speech: "noun" },
      { word: "Inflation", meaning: "Lạm phát", phonetic: "/ɪnˈfleɪʃn/", example: "Inflation affects the cost of living.", part_of_speech: "noun" },
      { word: "Recession", meaning: "Suy thoái", phonetic: "/rɪˈseʃn/", example: "The economy entered a recession.", part_of_speech: "noun" },
      { word: "Equity", meaning: "Vốn chủ sở hữu", phonetic: "/ˈekwəti/", example: "The homeowner has positive equity in the house.", part_of_speech: "noun" },
      { word: "Diversify", meaning: "Đa dạng hóa", phonetic: "/daɪˈvɜːrsɪfaɪ/", example: "It's wise to diversify your investments.", part_of_speech: "verb" },
      { word: "Bond", meaning: "Trái phiếu", phonetic: "/bɒnd/", example: "Government bonds are considered safe investments.", part_of_speech: "noun" },
      { word: "Index", meaning: "Chỉ số", phonetic: "/ˈɪndeks/", example: "The VN Index rose by 2% today.", part_of_speech: "noun" },
      { word: "Portfolio", meaning: "Danh mục đầu tư", phonetic: "/pɔːrtˈfoʊlioʊ/", example: "You should diversify your investment portfolio.", part_of_speech: "noun" },
      { word: "Merger", meaning: "Sáp nhập", phonetic: "/ˈmɜːrdʒər/", example: "The merger of the two companies was approved.", part_of_speech: "noun" },
      { word: "Audit", meaning: "Kiểm toán", phonetic: "/ˈɔːdɪt/", example: "The company undergoes an annual audit.", part_of_speech: "noun" },
      { word: "Depreciation", meaning: "Khấu hao", phonetic: "/dɪˌpriːʃiˈeɪʃn/", example: "Depreciation reduces the value of assets over time.", part_of_speech: "noun" },
      { word: "Liquidity", meaning: "Tính thanh khoản", phonetic: "/lɪˈkwɪdəti/", example: "Cash has high liquidity.", part_of_speech: "noun" },
      { word: "Solvency", meaning: "Khả năng thanh toán", phonetic: "/ˈsɒlvənsi/", example: "The bank checked the company's solvency.", part_of_speech: "noun" },
      { word: "Underwrite", meaning: "Bảo lãnh", phonetic: "/ˌʌndərˈraɪt/", example: "The bank underwrote the bond issuance.", part_of_speech: "verb" },
      { word: "Fiscal", meaning: "Thuộc tài chính", phonetic: "/ˈfɪskl/", example: "The government's fiscal policy was adjusted.", part_of_speech: "adjective" },
    ],
    "Science & Research": [
      { word: "Variable", meaning: "Biến số", phonetic: "/ˈveəriəbl/", example: "Temperature is an important variable in the experiment.", part_of_speech: "noun" },
      { word: "Correlation", meaning: "Tương quan", phonetic: "/ˌkɒrəˈleɪʃn/", example: "There is a correlation between exercise and health.", part_of_speech: "noun" },
      { word: "Qualitative", meaning: "Định tính", phonetic: "/ˈkwɒlɪtətɪv/", example: "Qualitative research explores people's experiences.", part_of_speech: "adjective" },
      { word: "Quantitative", meaning: "Định lượng", phonetic: "/ˈkwɒntɪtətɪv/", example: "Quantitative data was collected through surveys.", part_of_speech: "adjective" },
      { word: "Experiment", meaning: "Thí nghiệm", phonetic: "/ɪkˈsperɪmənt/", example: "The experiment was conducted in a lab.", part_of_speech: "noun" },
      { word: "Sample", meaning: "Mẫu", phonetic: "/ˈsæmpl/", example: "The sample size was 500 participants.", part_of_speech: "noun" },
      { word: "Theory", meaning: "Lý thuyết", phonetic: "/ˈθɪəri/", example: "Einstein's theory of relativity changed physics.", part_of_speech: "noun" },
      { word: "Laboratory", meaning: "Phòng thí nghiệm", phonetic: "/ˈlæbrətɔːri/", example: "The laboratory is equipped with modern tools.", part_of_speech: "noun" },
      { word: "Microscope", meaning: "Kính hiển vi", phonetic: "/ˈmaɪkrəskoʊp/", example: "The scientist used a microscope to observe cells.", part_of_speech: "noun" },
      { word: "Hypothesis", meaning: "Giả thuyết", phonetic: "/haɪˈpɒθəsɪs/", example: "The hypothesis was supported by the data.", part_of_speech: "noun" },
      { word: "Analysis", meaning: "Sự phân tích", phonetic: "/əˈnæləsɪs/", example: "The analysis revealed interesting patterns.", part_of_speech: "noun" },
      { word: "Data", meaning: "Dữ liệu", phonetic: "/ˈdeɪtə/", example: "The data was collected over six months.", part_of_speech: "noun" },
      { word: "Observation", meaning: "Quan sát", phonetic: "/ˌɒbzərˈveɪʃn/", example: "Careful observation is key to science.", part_of_speech: "noun" },
      { word: "Peer-reviewed", meaning: "Được bình duyệt", phonetic: "/pɪər rɪˈvjuːd/", example: "Only peer-reviewed studies were included.", part_of_speech: "adjective" },
      { word: "Calibration", meaning: "Hiệu chuẩn", phonetic: "/ˌkælɪˈbreɪʃn/", example: "The instrument needs regular calibration.", part_of_speech: "noun" },
      { word: "Control group", meaning: "Nhóm đối chứng", phonetic: "/kənˈtroʊl ɡruːp/", example: "The control group received a placebo.", part_of_speech: "noun" },
      { word: "Placebo", meaning: "Giả dược", phonetic: "/pləˈsiːboʊ/", example: "The placebo effect can influence results.", part_of_speech: "noun" },
      { word: "Replication", meaning: "Sự tái lập", phonetic: "/ˌreplɪˈkeɪʃn/", example: "Replication of results is important in science.", part_of_speech: "noun" },
      { word: "Validity", meaning: "Tính hợp lệ", phonetic: "/vəˈlɪdəti/", example: "The validity of the study was questioned.", part_of_speech: "noun" },
      { word: "Reliability", meaning: "Độ tin cậy", phonetic: "/rɪˌlaɪəˈbɪləti/", example: "The reliability of the data was verified.", part_of_speech: "noun" },
      { word: "Statistics", meaning: "Thống kê", phonetic: "/stəˈtɪstɪks/", example: "Statistics show a positive trend.", part_of_speech: "noun" },
      { word: "Probability", meaning: "Xác suất", phonetic: "/ˌprɒbəˈbɪləti/", example: "The probability of success is 90%.", part_of_speech: "noun" },
      { word: "Longitudinal", meaning: "Dọc (nghiên cứu)", phonetic: "/ˌlɒndʒɪˈtjuːdɪnl/", example: "A longitudinal study followed patients for 10 years.", part_of_speech: "adjective" },
    ],
    "Literature & Arts": [
      { word: "Novel", meaning: "Tiểu thuyết", phonetic: "/ˈnɒvl/", example: "She wrote a bestselling novel.", part_of_speech: "noun" },
      { word: "Poem", meaning: "Bài thơ", phonetic: "/ˈpoʊɪm/", example: "He recited a beautiful poem.", part_of_speech: "noun" },
      { word: "Author", meaning: "Tác giả", phonetic: "/ˈɔːθər/", example: "The author signed my book.", part_of_speech: "noun" },
      { word: "Genre", meaning: "Thể loại", phonetic: "/ˈʒɒnrə/", example: "What is your favorite literary genre?", part_of_speech: "noun" },
      { word: "Narrative", meaning: "Tự sự, câu chuyện", phonetic: "/ˈnærətɪv/", example: "The narrative is told from a child's perspective.", part_of_speech: "noun" },
      { word: "Protagonist", meaning: "Nhân vật chính", phonetic: "/prəˈtæɡənɪst/", example: "The protagonist faces many challenges.", part_of_speech: "noun" },
      { word: "Antagonist", meaning: "Nhân vật phản diện", phonetic: "/ænˈtæɡənɪst/", example: "The antagonist creates conflict in the story.", part_of_speech: "noun" },
      { word: "Metaphor", meaning: "Ẩn dụ", phonetic: "/ˈmetəfər/", example: "The poet used metaphor to convey emotion.", part_of_speech: "noun" },
      { word: "Symbolism", meaning: "Chủ nghĩa tượng trưng", phonetic: "/ˈsɪmbəlɪzəm/", example: "The novel is rich in symbolism.", part_of_speech: "noun" },
      { word: "Irony", meaning: "Mỉa mai, trớ trêu", phonetic: "/ˈaɪrəni/", example: "The irony was that he won by losing.", part_of_speech: "noun" },
      { word: "Painting", meaning: "Bức tranh", phonetic: "/ˈpeɪntɪŋ/", example: "This painting is from the Renaissance period.", part_of_speech: "noun" },
      { word: "Sculpture", meaning: "Tác phẩm điêu khắc", phonetic: "/ˈskʌlptʃər/", example: "The sculpture is made of marble.", part_of_speech: "noun" },
      { word: "Criticism", meaning: "Phê bình", phonetic: "/ˈkrɪtɪsɪzəm/", example: "Literary criticism analyzes texts deeply.", part_of_speech: "noun" },
      { word: "Aesthetic", meaning: "Thẩm mỹ", phonetic: "/esˈθetɪk/", example: "The aesthetic of the building is modernist.", part_of_speech: "adjective" },
      { word: "Rhetoric", meaning: "Thuật hùng biện", phonetic: "/ˈretərɪk/", example: "The speech used powerful rhetoric.", part_of_speech: "noun" },
      { word: "Allegory", meaning: "Ngụ ngôn", phonetic: "/ˈæləɡɔːri/", example: "The story is an allegory for freedom.", part_of_speech: "noun" },
      { word: "Foreshadowing", meaning: "Điềm báo", phonetic: "/fɔːrˈʃædoʊɪŋ/", example: "The early chapters contain foreshadowing.", part_of_speech: "noun" },
      { word: "Hyperbole", meaning: "Nói quá", phonetic: "/haɪˈpɜːrbəli/", example: "Hyperbole is used for dramatic effect.", part_of_speech: "noun" },
      { word: "Imagery", meaning: "Hình ảnh", phonetic: "/ˈɪmɪdʒəri/", example: "The poet uses vivid imagery.", part_of_speech: "noun" },
      { word: "Motif", meaning: "Mô típ", phonetic: "/moʊˈtiːf/", example: "The motif of light and darkness recurs.", part_of_speech: "noun" },
      { word: "Personification", meaning: "Nhân cách hóa", phonetic: "/pərˌsɒnɪfɪˈkeɪʃn/", example: "Personification gives human traits to objects.", part_of_speech: "noun" },
      { word: "Satire", meaning: "Châm biếm", phonetic: "/ˈsætaɪər/", example: "The novel is a satire of politics.", part_of_speech: "noun" },
      { word: "Stanza", meaning: "Khổ thơ", phonetic: "/ˈstænzə/", example: "The poem has four stanzas.", part_of_speech: "noun" },
      { word: "Theme", meaning: "Chủ đề", phonetic: "/θiːm/", example: "The main theme of the book is love.", part_of_speech: "noun" },
      { word: "Alliteration", meaning: "Điệp âm", phonetic: "/əˌlɪtəˈreɪʃn/", example: "Alliteration repeats the same initial sound.", part_of_speech: "noun" },
    ],
    "Law & Politics": [
      { word: "Jurisdiction", meaning: "Quyền tài phán", phonetic: "/ˌdʒʊrɪsˈdɪkʃn/", example: "The court has jurisdiction over this case.", part_of_speech: "noun" },
      { word: "Legislature", meaning: "Cơ quan lập pháp", phonetic: "/ˈledʒɪslətʃər/", example: "The legislature passed a new law.", part_of_speech: "noun" },
      { word: "Precedent", meaning: "Tiền lệ", phonetic: "/ˈpresɪdənt/", example: "This ruling sets a new precedent.", part_of_speech: "noun" },
      { word: "Sovereignty", meaning: "Chủ quyền", phonetic: "/ˈsɒvrənti/", example: "The country's sovereignty was respected.", part_of_speech: "noun" },
      { word: "Amend", meaning: "Sửa đổi", phonetic: "/əˈmend/", example: "They voted to amend the constitution.", part_of_speech: "verb" },
      { word: "Constitution", meaning: "Hiến pháp", phonetic: "/ˌkɒnstɪˈtjuːʃn/", example: "The constitution guarantees basic rights.", part_of_speech: "noun" },
      { word: "Democracy", meaning: "Dân chủ", phonetic: "/dɪˈmɒkrəsi/", example: "Democracy allows citizens to vote.", part_of_speech: "noun" },
      { word: "Legislation", meaning: "Pháp luật, luật", phonetic: "/ˌledʒɪsˈleɪʃn/", example: "New legislation was introduced this year.", part_of_speech: "noun" },
      { word: "Plaintiff", meaning: "Nguyên đơn", phonetic: "/ˈpleɪntɪf/", example: "The plaintiff filed a lawsuit.", part_of_speech: "noun" },
      { word: "Defendant", meaning: "Bị đơn", phonetic: "/dɪˈfendənt/", example: "The defendant pleaded not guilty.", part_of_speech: "noun" },
      { word: "Verdict", meaning: "Phán quyết", phonetic: "/ˈvɜːrdɪkt/", example: "The jury reached a verdict.", part_of_speech: "noun" },
      { word: "Testimony", meaning: "Lời khai", phonetic: "/ˈtestɪməni/", example: "The witness gave testimony in court.", part_of_speech: "noun" },
      { word: "Ratify", meaning: "Phê chuẩn", phonetic: "/ˈrætɪfaɪ/", example: "The treaty was ratified by all parties.", part_of_speech: "verb" },
      { word: "Diplomacy", meaning: "Ngoại giao", phonetic: "/dɪˈploʊməsi/", example: "Diplomacy is essential for international relations.", part_of_speech: "noun" },
      { word: "Impeach", meaning: "Luận tội", phonetic: "/ɪmˈpiːtʃ/", example: "The committee voted to impeach the official.", part_of_speech: "verb" },
      { word: "Appeal", meaning: "Kháng cáo", phonetic: "/əˈpiːl/", example: "The lawyer filed an appeal.", part_of_speech: "noun" },
      { word: "Arbitration", meaning: "Trọng tài", phonetic: "/ˌɑːrbɪˈtreɪʃn/", example: "The dispute was settled through arbitration.", part_of_speech: "noun" },
      { word: "Consensus", meaning: "Đồng thuận", phonetic: "/kənˈsensəs/", example: "The parties reached a consensus.", part_of_speech: "noun" },
      { word: "Constituency", meaning: "Khu vực bầu cử", phonetic: "/kənˈstɪtʃuənsi/", example: "The MP represents a rural constituency.", part_of_speech: "noun" },
      { word: "Delegate", meaning: "Đại biểu", phonetic: "/ˈdelɪɡət/", example: "Each country sent a delegate to the summit.", part_of_speech: "noun" },
      { word: "Embassy", meaning: "Đại sứ quán", phonetic: "/ˈembəsi/", example: "Contact the embassy for visa information.", part_of_speech: "noun" },
      { word: "Immunity", meaning: "Quyền miễn trừ", phonetic: "/ɪˈmjuːnəti/", example: "Diplomatic immunity protects ambassadors.", part_of_speech: "noun" },
      { word: "Injunction", meaning: "Lệnh cấm", phonetic: "/ɪnˈdʒʌŋkʃn/", example: "The court issued an injunction.", part_of_speech: "noun" },
      { word: "Ratification", meaning: "Sự phê chuẩn", phonetic: "/ˌrætɪfɪˈkeɪʃn/", example: "Ratification requires a two-thirds majority.", part_of_speech: "noun" },
      { word: "Sanction", meaning: "Trừng phạt", phonetic: "/ˈsæŋkʃn/", example: "Economic sanctions were imposed.", part_of_speech: "noun" },
    ],
    "Electrical & Electronics Engineering": [
      { word: "Circuit", meaning: "Mạch điện", phonetic: "/ˈsɜːrkɪt/", example: "The circuit connects the battery to the motor.", part_of_speech: "noun" },
      { word: "Voltage", meaning: "Điện áp", phonetic: "/ˈvoʊltɪdʒ/", example: "The voltage across the resistor is 5V.", part_of_speech: "noun" },
      { word: "Current", meaning: "Dòng điện", phonetic: "/ˈkʌrənt/", example: "The current flowing through the wire is 2A.", part_of_speech: "noun" },
      { word: "Resistance", meaning: "Điện trở", phonetic: "/rɪˈzɪstəns/", example: "Copper has low electrical resistance.", part_of_speech: "noun" },
      { word: "Capacitor", meaning: "Tụ điện", phonetic: "/kəˈpæsɪtər/", example: "The capacitor stores electrical charge.", part_of_speech: "noun" },
      { word: "Inductor", meaning: "Cuộn cảm", phonetic: "/ɪnˈdʌktər/", example: "The inductor resists changes in current.", part_of_speech: "noun" },
      { word: "Transformer", meaning: "Máy biến áp", phonetic: "/trænsˈfɔːrmər/", example: "The transformer steps up the voltage to 220V.", part_of_speech: "noun" },
      { word: "Diode", meaning: "Điốt", phonetic: "/ˈdaɪoʊd/", example: "A diode allows current to flow in only one direction.", part_of_speech: "noun" },
      { word: "Transistor", meaning: "Transistor", phonetic: "/trænˈzɪstər/", example: "The transistor acts as a switch or amplifier.", part_of_speech: "noun" },
      { word: "Oscilloscope", meaning: "Máy hiện sóng", phonetic: "/əˈsɪləskoʊp/", example: "We used an oscilloscope to observe the signal waveform.", part_of_speech: "noun" },
      { word: "Amplifier", meaning: "Bộ khuếch đại", phonetic: "/ˈæmplɪfaɪər/", example: "The amplifier increases the audio signal strength.", part_of_speech: "noun" },
      { word: "Frequency", meaning: "Tần số", phonetic: "/ˈfriːkwənsi/", example: "The signal has a frequency of 60 Hz.", part_of_speech: "noun" },
      { word: "Impedance", meaning: "Trở kháng", phonetic: "/ɪmˈpiːdns/", example: "The input impedance of the circuit is 50 ohms.", part_of_speech: "noun" },
      { word: "Semiconductor", meaning: "Chất bán dẫn", phonetic: "/ˌsemikənˈdʌktər/", example: "Silicon is the most common semiconductor material.", part_of_speech: "noun" },
      { word: "Microcontroller", meaning: "Vi điều khiển", phonetic: "/ˌmaɪkroʊkənˈtroʊlər/", example: "The Arduino is a popular microcontroller board.", part_of_speech: "noun" },
      { word: "Pulse Width Modulation", meaning: "Điều chế độ rộng xung", phonetic: "/pʌls wɪdθ ˌmɒdʒʊˈleɪʃn/", example: "PWM is used to control the speed of DC motors.", part_of_speech: "noun" },
      { word: "Rectifier", meaning: "Bộ chỉnh lưu", phonetic: "/ˈrektɪfaɪər/", example: "A rectifier converts AC to DC.", part_of_speech: "noun" },
      { word: "Sensor", meaning: "Cảm biến", phonetic: "/ˈsensər/", example: "The temperature sensor sends data to the microcontroller.", part_of_speech: "noun" },
      { word: "Actuator", meaning: "Cơ cấu chấp hành", phonetic: "/ˈæktjueɪtər/", example: "The actuator converts electrical signals into mechanical motion.", part_of_speech: "noun" },
      { word: "Ground", meaning: "Mát (đất)", phonetic: "/ɡraʊnd/", example: "Connect the negative terminal to ground.", part_of_speech: "noun" },
      { word: "Waveform", meaning: "Dạng sóng", phonetic: "/ˈweɪvfɔːrm/", example: "The sine waveform is the most fundamental AC signal.", part_of_speech: "noun" },
      { word: "Feedback", meaning: "Phản hồi", phonetic: "/ˈfiːdbæk/", example: "Negative feedback stabilizes the amplifier.", part_of_speech: "noun" },
      { word: "Logic gate", meaning: "Cổng logic", phonetic: "/ˈlɒdʒɪk ɡeɪt/", example: "AND and OR are basic logic gates.", part_of_speech: "noun" },
      { word: "Printed Circuit Board", meaning: "Bảng mạch in", phonetic: "/ˈprɪntɪd ˈsɜːrkɪt bɔːrd/", example: "The PCB connects all electronic components.", part_of_speech: "noun" },
      { word: "Oscillator", meaning: "Bộ dao động", phonetic: "/ˈɒsɪleɪtər/", example: "The crystal oscillator generates a stable clock signal.", part_of_speech: "noun" },
      { word: "Breadboard", meaning: "Bảng mạch thử", phonetic: "/ˈbredbɔːrd/", example: "Prototype the circuit on a breadboard first.", part_of_speech: "noun" },
      { word: "Decoder", meaning: "Bộ giải mã", phonetic: "/diːˈkoʊdər/", example: "The decoder converts binary data to a display signal.", part_of_speech: "noun" },
      { word: "Encoder", meaning: "Bộ mã hóa", phonetic: "/ɪnˈkoʊdər/", example: "The encoder converts analog position to digital signal.", part_of_speech: "noun" },
      { word: "Thermistor", meaning: "Nhiệt điện trở", phonetic: "/θɜːrˈmɪstər/", example: "A thermistor changes resistance with temperature.", part_of_speech: "noun" },
      { word: "Zener diode", meaning: "Điốt Zener", phonetic: "/ˈziːnər ˈdaɪoʊd/", example: "A Zener diode regulates voltage in a circuit.", part_of_speech: "noun" },
      { word: "FET", meaning: "Transistor hiệu ứng trường", phonetic: "/ef iː tiː/", example: "A FET has high input impedance.", part_of_speech: "noun" },
      { word: "SCR", meaning: "Thyristor", phonetic: "/es siː ɑːr/", example: "An SCR is used for power control.", part_of_speech: "noun" },
      { word: "Relay", meaning: "Rơ le", phonetic: "/ˈriːleɪ/", example: "The relay switches the high-power circuit.", part_of_speech: "noun" },
      { word: "Potentiometer", meaning: "Biến trở", phonetic: "/pəˌtenʃiˈɒmɪtər/", example: "Adjust the potentiometer to change the voltage.", part_of_speech: "noun" },
      { word: "Solenoid", meaning: "Nam châm điện", phonetic: "/ˈsoʊlənɔɪd/", example: "The solenoid valve controls fluid flow.", part_of_speech: "noun" },
    ],
  };

  // Get topic IDs
  const topicRows = db.exec("SELECT id, name FROM vocabulary_topics");
  const topicMap: Record<string, number> = {};
  if (topicRows.length > 0) {
    for (const row of topicRows[0].values) {
      topicMap[row[1] as string] = row[0] as number;
    }
  }

  for (const [topicName, words] of Object.entries(wordsByTopic)) {
    const topicId = topicMap[topicName];
    if (!topicId) continue;
    for (const w of words) {
      db.run(
        "INSERT INTO vocabulary_words (topic_id, word, meaning, phonetic, example, part_of_speech) VALUES (?, ?, ?, ?, ?, ?)",
        [topicId, w.word, w.meaning, w.phonetic, w.example, w.part_of_speech]
      );
    }
  }
}

const stressRulesData = [
  {
    title: "Hậu tố nhấn vào chính nó",
    description: "Các hậu tố -ee, -eer, -ese, -ique, -aire luôn nhận trọng âm",
    rule: "Các từ kết thúc bằng -ee, -eer, -ese, -ique, -aire → nhấn vào chính hậu tố đó (âm tiết cuối).",
    examples: [
      { word: "employee", phonetic: "/ɪmˈplɔɪiː/", stressed_part: "-ee", explanation: "Hậu tố -ee được nhấn mạnh" },
      { word: "referee", phonetic: "/ˌrefəˈriː/", stressed_part: "-ee", explanation: "Trọng âm rơi vào -ee" },
      { word: "engineer", phonetic: "/ˌendʒɪˈnɪr/", stressed_part: "-eer", explanation: "Hậu tố -eer được nhấn mạnh" },
      { word: "pioneer", phonetic: "/ˌpaɪəˈnɪr/", stressed_part: "-eer", explanation: "Trọng âm rơi vào -eer" },
      { word: "Chinese", phonetic: "/ˌtʃaɪˈniːz/", stressed_part: "-ese", explanation: "Hậu tố -ese được nhấn mạnh" },
      { word: "Japanese", phonetic: "/ˌdʒæpəˈniːz/", stressed_part: "-ese", explanation: "Trọng âm rơi vào -ese" },
      { word: "unique", phonetic: "/juˈniːk/", stressed_part: "-ique", explanation: "Hậu tố -ique được nhấn mạnh" },
      { word: "antique", phonetic: "/ænˈtiːk/", stressed_part: "-ique", explanation: "Trọng âm rơi vào -ique" },
      { word: "millionaire", phonetic: "/ˌmɪljəˈner/", stressed_part: "-aire", explanation: "Hậu tố -aire được nhấn mạnh" },
    ],
  },
  {
    title: "Hậu tố nhấn vào âm tiết liền trước",
    description: "Các hậu tố -ion, -ious, -ial, -ual, -ic, -ical, -eous, -ious → nhấn âm tiết ngay trước hậu tố",
    rule: "Các từ kết thúc bằng -ion, -ious, -ial, -ual, -ic, -ical, -eous, -ious → nhấn vào âm tiết ngay trước hậu tố.",
    examples: [
      { word: "education", phonetic: "/ˌedʒuˈkeɪʃn/", stressed_part: "-ca-", explanation: "Nhấn trước -tion: edu-CA-tion" },
      { word: "nation", phonetic: "/ˈneɪʃn/", stressed_part: "-na-", explanation: "Nhấn trước -tion: NA-tion" },
      { word: "decision", phonetic: "/dɪˈsɪʒn/", stressed_part: "-ci-", explanation: "Nhấn trước -sion: de-CI-sion" },
      { word: "delicious", phonetic: "/dɪˈlɪʃəs/", stressed_part: "-li-", explanation: "Nhấn trước -cious: de-LI-cious" },
      { word: "serious", phonetic: "/ˈsɪriəs/", stressed_part: "-ri-", explanation: "Nhấn trước -rious: SE-ri-ous" },
      { word: "commercial", phonetic: "/kəˈmɜːrʃl/", stressed_part: "-mer-", explanation: "Nhấn trước -cial: com-MER-cial" },
      { word: "industrial", phonetic: "/ɪnˈdʌstriəl/", stressed_part: "-dus-", explanation: "Nhấn trước -trial: in-DUS-trial" },
      { word: "economic", phonetic: "/ˌiːkəˈnɒmɪk/", stressed_part: "-nom-", explanation: "Nhấn trước -mic: e-co-NO-mic" },
      { word: "specific", phonetic: "/spəˈsɪfɪk/", stressed_part: "-cif-", explanation: "Nhấn trước -fic: spe-CI-fic" },
      { word: "courageous", phonetic: "/kəˈreɪdʒəs/", stressed_part: "-ra-", explanation: "Nhấn trước -geous: cou-RA-geous" },
    ],
  },
  {
    title: "Hậu tố nhấn vào âm thứ 3 từ cuối",
    description: "Các hậu tố -ity, -ify, -ize/-ise, -graphy, -logy, -sophy → nhấn âm thứ 3 từ cuối lên",
    rule: "Các từ kết thúc bằng -ity, -ify, -ize/-ise, -graphy, -logy, -sophy → nhấn vào âm tiết thứ 3 từ dưới lên (tính từ cuối).",
    examples: [
      { word: "activity", phonetic: "/ækˈtɪvəti/", stressed_part: "-ti-", explanation: "Nhấn âm thứ 3 từ cuối: ac-TI-vi-ty" },
      { word: "possibility", phonetic: "/ˌpɒsəˈbɪləti/", stressed_part: "-bi-", explanation: "Nhấn: pos-si-BI-li-ty" },
      { word: "identify", phonetic: "/aɪˈdentɪfaɪ/", stressed_part: "-den-", explanation: "Nhấn: i-DEN-ti-fy" },
      { word: "classify", phonetic: "/ˈklæsɪfaɪ/", stressed_part: "-clas-", explanation: "Nhấn: CLAS-si-fy" },
      { word: "recognize", phonetic: "/ˈrekəɡnaɪz/", stressed_part: "-rec-", explanation: "Nhấn: REC-og-nize" },
      { word: "geography", phonetic: "/dʒiˈɒɡrəfi/", stressed_part: "-og-", explanation: "Nhấn: ge-OG-ra-phy" },
      { word: "photography", phonetic: "/fəˈtɒɡrəfi/", stressed_part: "-tog-", explanation: "Nhấn: pho-TOG-ra-phy" },
      { word: "biology", phonetic: "/baɪˈɒlədʒi/", stressed_part: "-ol-", explanation: "Nhấn: bi-OL-o-gy" },
      { word: "psychology", phonetic: "/saɪˈkɒlədʒi/", stressed_part: "-kol-", explanation: "Nhấn: psy-KOL-o-gy" },
      { word: "philosophy", phonetic: "/fɪˈlɒsəfi/", stressed_part: "-los-", explanation: "Nhấn: phi-LOS-o-phy" },
    ],
  },
  {
    title: "Hậu tố không làm thay đổi trọng âm",
    description: "Các hậu tố -ment, -ness, -less, -ful, -ly, -ship giữ nguyên trọng âm từ gốc",
    rule: "Các hậu tố -ment, -ness, -less, -ful, -ly, -ship, -hood, -ing → KHÔNG làm thay đổi trọng âm của từ gốc. Trọng âm giữ nguyên như từ gốc.",
    examples: [
      { word: "enjoyment", phonetic: "/ɪnˈdʒɔɪmənt/", stressed_part: "-joy-", explanation: "enJOY + ment → enJOYment (giữ nguyên)" },
      { word: "government", phonetic: "/ˈɡʌvərnmənt/", stressed_part: "-gov-", explanation: "GOVern + ment → GOVernment (giữ nguyên)" },
      { word: "happiness", phonetic: "/ˈhæpinəs/", stressed_part: "-hap-", explanation: "HAPPY + ness → HAPPiness (giữ nguyên)" },
      { word: "careless", phonetic: "/ˈkerləs/", stressed_part: "-care-", explanation: "CARE + less → CAREless (giữ nguyên)" },
      { word: "beautiful", phonetic: "/ˈbjuːtɪfl/", stressed_part: "-beau-", explanation: "BEAUty + ful → BEAUtiful (giữ nguyên)" },
      { word: "quickly", phonetic: "/ˈkwɪkli/", stressed_part: "-quick-", explanation: "QUICK + ly → QUICKly (giữ nguyên)" },
      { word: "friendship", phonetic: "/ˈfrendʃɪp/", stressed_part: "-friend-", explanation: "FRIEND + ship → FRIENDship (giữ nguyên)" },
      { word: "childhood", phonetic: "/ˈtʃaɪldhʊd/", stressed_part: "-child-", explanation: "CHILD + hood → CHILDhood (giữ nguyên)" },
    ],
  },
  {
    title: "Hậu tố -ate, -ize, -ish (động từ & tính từ)",
    description: "Quy tắc trọng âm cho động từ kết thúc bằng -ate, -ize, -ish",
    rule: "Động từ kết thúc bằng -ate → thường nhấn âm thứ 3 từ cuối. Động từ kết thúc bằng -ize → thường nhấn âm thứ 3 từ cuối. Tính từ kết thúc bằng -ish → nhấn vào âm tiết đầu (trừ động từ).",
    examples: [
      { word: "communicate", phonetic: "/kəˈmjuːnɪkeɪt/", stressed_part: "-mu-", explanation: "Nhấn âm thứ 3 từ cuối: com-MU-ni-cate" },
      { word: "demonstrate", phonetic: "/ˈdemənstreɪt/", stressed_part: "-dem-", explanation: "Nhấn: DEM-on-strate" },
      { word: "concentrate", phonetic: "/ˈkɒnsntreɪt/", stressed_part: "-con-", explanation: "Nhấn: CON-cen-trate" },
      { word: "apologize", phonetic: "/əˈpɒlədʒaɪz/", stressed_part: "-pol-", explanation: "Nhấn: a-POL-o-gize" },
      { word: "realize", phonetic: "/ˈriːəlaɪz/", stressed_part: "-re-", explanation: "Nhấn: RE-al-ize" },
      { word: "English", phonetic: "/ˈɪŋɡlɪʃ/", stressed_part: "-Eng-", explanation: "Nhấn đầu: ENG-lish (tính từ)" },
      { word: "foolish", phonetic: "/ˈfuːlɪʃ/", stressed_part: "-fool-", explanation: "Nhấn đầu: FOOL-ish (tính từ)" },
    ],
  },
  {
    title: "Hậu tố -ade, -oo, -oon, -self, -elle (nhấn cuối)",
    description: "Các hậu tố -ade, -oo, -oon, -self, -elle nhận trọng âm",
    rule: "Các từ kết thúc bằng -ade, -oo, -oon, -self, -elle → nhấn vào hậu tố (âm tiết cuối).",
    examples: [
      { word: "lemonade", phonetic: "/ˌleməˈneɪd/", stressed_part: "-nade", explanation: "Nhấn vào -nade: lem-o-NADE" },
      { word: "parade", phonetic: "/pəˈreɪd/", stressed_part: "-rade", explanation: "Nhấn vào -rade: pa-RADE" },
      { word: "bamboo", phonetic: "/ˌbæmˈbuː/", stressed_part: "-boo", explanation: "Nhấn vào -boo: bam-BOO" },
      { word: "kangaroo", phonetic: "/ˌkæŋɡəˈruː/", stressed_part: "-roo", explanation: "Nhấn vào -roo: kan-ga-ROO" },
      { word: "typhoon", phonetic: "/taɪˈfuːn/", stressed_part: "-phoon", explanation: "Nhấn vào -phoon: ty-PHOON" },
      { word: "balloon", phonetic: "/bəˈluːn/", stressed_part: "-loon", explanation: "Nhấn vào -loon: bal-LOON" },
      { word: "myself", phonetic: "/maɪˈself/", stressed_part: "-self", explanation: "Nhấn vào -self: my-SELF" },
      { word: "boatelle", phonetic: "/ˌboʊˈtel/", stressed_part: "-telle", explanation: "Nhấn vào -telle: bo-TELLE" },
    ],
  },
  {
    title: "Đuôi -ing: giữ nguyên trọng âm gốc",
    description: "Khi thêm -ing vào động từ, trọng âm giữ nguyên như động từ gốc. Trong danh từ ghép có -ing, nhấn từ đầu.",
    rule: "Động từ thêm -ing → trọng âm giữ nguyên như động từ gốc (be'gin → be'ginning). Danh từ ghép với -ing → nhấn phần đầu ('shopping list, 'swimming pool).",
    examples: [
      { word: "beginning", phonetic: "/bɪˈɡɪnɪŋ/", stressed_part: "-gin-", explanation: "beGIN → beGINning (giữ nguyên trọng âm)" },
      { word: "relaxing", phonetic: "/rɪˈlæksɪŋ/", stressed_part: "-lax-", explanation: "reLAX → reLAXing (giữ nguyên)" },
      { word: "offering", phonetic: "/ˈɒfərɪŋ/", stressed_part: "-of-", explanation: "OFFer → OFFering (giữ nguyên)" },
      { word: "listening", phonetic: "/ˈlɪsənɪŋ/", stressed_part: "-lis-", explanation: "LISTen → LISTening (giữ nguyên)" },
      { word: "remembering", phonetic: "/rɪˈmembərɪŋ/", stressed_part: "-mem-", explanation: "reMEMber → reMEMbering (giữ nguyên)" },
      { word: "shopping list", phonetic: "/ˈʃɒpɪŋ lɪst/", stressed_part: "shop-", explanation: "Danh từ ghép: SHOPping list (nhấn phần đầu)" },
      { word: "swimming pool", phonetic: "/ˈswɪmɪŋ puːl/", stressed_part: "swim-", explanation: "Danh từ ghép: SWIMming pool (nhấn phần đầu)" },
      { word: "waiting room", phonetic: "/ˈweɪtɪŋ ruːm/", stressed_part: "wait-", explanation: "Danh từ ghép: WAITing room (nhấn phần đầu)" },
      { word: "dancing shoes", phonetic: "/ˈdænsɪŋ ʃuːz/", stressed_part: "dance-", explanation: "Danh từ ghép: DANCing shoes (nhấn phần đầu)" },
      { word: "interesting", phonetic: "/ˈɪntrəstɪŋ/", stressed_part: "-in-", explanation: "INterest → INteresting (giữ nguyên)" },
    ],
  },
  {
    title: "Từ 2 âm tiết kết thúc bằng -y, -ow, -le, -er",
    description: "Hầu hết các tính từ và danh từ 2 âm tiết kết thúc bằng -y, -ow, -le, -er có trọng âm rơi vào âm tiết đầu.",
    rule: "Tính từ/danh từ 2 âm tiết kết thúc bằng -y, -ow, -le, -er, -en → thường nhấn âm tiết đầu. (Ngoại lệ: một số động từ có thể nhấn âm cuối.)",
    examples: [
      { word: "happy", phonetic: "/ˈhæpi/", stressed_part: "-hap-", explanation: "Tính từ -y: HAPpy" },
      { word: "busy", phonetic: "/ˈbɪzi/", stressed_part: "-bus-", explanation: "Tính từ -y: BUSy" },
      { word: "easy", phonetic: "/ˈiːzi/", stressed_part: "-eas-", explanation: "Tính từ -y: EAasy" },
      { word: "lovely", phonetic: "/ˈlʌvli/", stressed_part: "-love-", explanation: "Kết thúc -ly: LOVEly" },
      { word: "yellow", phonetic: "/ˈjeloʊ/", stressed_part: "-yel-", explanation: "Kết thúc -ow: YELlow" },
      { word: "narrow", phonetic: "/ˈnæroʊ/", stressed_part: "-nar-", explanation: "Kết thúc -ow: NARrow" },
      { word: "table", phonetic: "/ˈteɪbl/", stressed_part: "-ta-", explanation: "Kết thúc -le: TAble" },
      { word: "simple", phonetic: "/ˈsɪmpl/", stressed_part: "-sim-", explanation: "Kết thúc -le: SIMple" },
      { word: "teacher", phonetic: "/ˈtiːtʃər/", stressed_part: "-teach-", explanation: "Kết thúc -er: TEACHer" },
      { word: "garden", phonetic: "/ˈɡɑːrdn/", stressed_part: "-gar-", explanation: "Kết thúc -en: GARden" },
    ],
  },
  {
    title: "Danh từ ghép & động từ ghép",
    description: "Danh từ ghép thường nhấn phần đầu. Động từ ghép thường nhấn phần sau. Tính từ ghép thường nhấn phần sau.",
    rule: "Danh từ ghép (noun + noun) → nhấn phần đầu ('greenhouse, 'bookstore). Động từ ghép (verb + particle) → nhấn phần sau (over'look, under'stand). Tính từ ghép → thường nhấn phần sau (well-'known, bad-'tempered).",
    examples: [
      { word: "greenhouse", phonetic: "/ˈɡriːnhaʊs/", stressed_part: "green-", explanation: "Danh từ ghép: GREENhouse (nhấn đầu)" },
      { word: "bookstore", phonetic: "/ˈbʊkstɔːr/", stressed_part: "book-", explanation: "Danh từ ghép: BOOKstore" },
      { word: "birthday", phonetic: "/ˈbɜːrθdeɪ/", stressed_part: "birth-", explanation: "Danh từ ghép: BIRTHday" },
      { word: "airport", phonetic: "/ˈerpɔːrt/", stressed_part: "air-", explanation: "Danh từ ghép: AIRport" },
      { word: "understand", phonetic: "/ˌʌndərˈstænd/", stressed_part: "-stand", explanation: "Động từ ghép: under-STAND (nhấn sau)" },
      { word: "overlook", phonetic: "/ˌoʊvərˈlʊk/", stressed_part: "-look", explanation: "Động từ ghép: over-LOOK (nhấn sau)" },
      { word: "well-known", phonetic: "/ˌwel ˈnoʊn/", stressed_part: "-known", explanation: "Tính từ ghép: well-KNOWN (nhấn sau)" },
      { word: "old-fashioned", phonetic: "/ˌoʊld ˈfæʃnd/", stressed_part: "-fash-", explanation: "Tính từ ghép: old-FASHioned" },
    ],
  },
  {
    title: "Hậu tố -able, -ible, -al, -cian, -sian",
    description: "Các hậu tố -able, -ible, -al, -cian, -sian → nhấn âm tiết ngay trước hậu tố.",
    rule: "Các từ kết thúc bằng -able, -ible → nhấn ngay trước hậu tố. Kết thúc bằng -cian, -sian → nhấn vào -cian/-sian. Kết thúc bằng -al (đặc biệt -ical, -ual) → nhấn ngay trước -al.",
    examples: [
      { word: "comfortable", phonetic: "/ˈkʌmftəbl/", stressed_part: "-comf-", explanation: "Nhấn trước -able: COMfortable" },
      { word: "possible", phonetic: "/ˈpɒsəbl/", stressed_part: "-pos-", explanation: "Nhấn trước -ible: POSsible" },
      { word: "terrible", phonetic: "/ˈterəbl/", stressed_part: "-ter-", explanation: "Nhấn trước -ible: TERrible" },
      { word: "national", phonetic: "/ˈnæʃənl/", stressed_part: "-na-", explanation: "Nhấn trước -al: NAtional" },
      { word: "traditional", phonetic: "/trəˈdɪʃənl/", stressed_part: "-di-", explanation: "Nhấn trước -al: tra-DItional" },
      { word: "musician", phonetic: "/mjuˈzɪʃn/", stressed_part: "-si-", explanation: "Nhấn trước -cian: mu-SIcian" },
      { word: "physician", phonetic: "/fɪˈzɪʃn/", stressed_part: "-si-", explanation: "Nhấn trước -cian: phy-SIcian" },
      { word: "electrician", phonetic: "/ɪˌlekˈtrɪʃn/", stressed_part: "-tri-", explanation: "Nhấn trước -cian: e-lec-TRIcian" },
    ],
  },
  {
    title: "Tiếp đầu ngữ (prefixes): không làm thay đổi trọng âm",
    description: "Các tiếp đầu ngữ un-, re-, pre-, dis-, mis-, over-, under- thường KHÔNG nhận trọng âm. Trọng âm rơi vào âm tiết chính của từ gốc.",
    rule: "Tiếp đầu ngữ (prefix) un-, re-, pre-, dis-, mis-, over-, under-, out- → trọng âm rơi vào từ gốc, KHÔNG rơi vào tiếp đầu ngữ (trừ một số ngoại lệ như 'underwear, 'overcoat là danh từ ghép nhấn đầu).",
    examples: [
      { word: "unhappy", phonetic: "/ʌnˈhæpi/", stressed_part: "-hap-", explanation: "un + HAPPy → un-HAPpy (nhấn từ gốc)" },
      { word: "rewrite", phonetic: "/ˌriːˈraɪt/", stressed_part: "-write", explanation: "re + WRITE → re-WRITE (nhấn từ gốc)" },
      { word: "preview", phonetic: "/ˈpriːvjuː/", stressed_part: "-view", explanation: "pre + VIEW → PREview (nhấn từ gốc)" },
      { word: "disagree", phonetic: "/ˌdɪsəˈɡriː/", stressed_part: "-gree", explanation: "dis + aGREE → dis-a-GREE (nhấn từ gốc)" },
      { word: "misunderstand", phonetic: "/ˌmɪsʌndərˈstænd/", stressed_part: "-stand", explanation: "mis + underSTAND → mis-un-der-STAND" },
      { word: "overcome", phonetic: "/ˌoʊvərˈkʌm/", stressed_part: "-come", explanation: "over + COME → o-ver-COME (nhấn từ gốc)" },
      { word: "underwear", phonetic: "/ˈʌndərwer/", stressed_part: "-un-", explanation: "Ngoại lệ: UNderwear (danh từ ghép, nhấn đầu)" },
      { word: "output", phonetic: "/ˈaʊtpʊt/", stressed_part: "-out-", explanation: "Ngoại lệ: OUTput (danh từ, nhấn đầu)" },
      { word: "upgrade", phonetic: "/ˌʌpˈɡreɪd/", stressed_part: "-grade", explanation: "up + GRADE → up-GRADE (nhấn từ gốc)" },
    ],
  },
];

async function insertStressRules(db: any) {
  db.run("DELETE FROM stress_examples");
  db.run("DELETE FROM stress_rules");
  for (const rule of stressRulesData) {
    db.run("INSERT INTO stress_rules (title, description, rule, level, order_index) VALUES (?, ?, ?, ?, ?)",
      [rule.title, rule.description, rule.rule, "intermediate", stressRulesData.indexOf(rule) + 1]);
    const ruleId = db.exec("SELECT last_insert_rowid() as id")[0].values[0][0];
    for (const ex of rule.examples) {
      db.run("INSERT INTO stress_examples (rule_id, word, phonetic, stressed_part, explanation) VALUES (?, ?, ?, ?, ?)",
        [ruleId, ex.word, ex.phonetic, ex.stressed_part, ex.explanation]);
    }
  }
}

async function seed() {
  await initSchema();
  const db = await getDb();
  const hash = await bcrypt.hash("admin123", 10);
  const hashUser = await bcrypt.hash("user123", 10);

  // Seed admin user
  const existing = db.exec("SELECT id FROM users WHERE email = ?", ["admin@engzone.com"]);
  if (!existing.length || !existing[0].values.length) {
    db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      ["Admin", "admin@engzone.com", hash, "admin"]);
  }

  // Seed regular user
  const existingUser = db.exec("SELECT id FROM users WHERE email = ?", ["user@engzone.com"]);
  if (!existingUser.length || !existingUser[0].values.length) {
    db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      ["Nguyen Van A", "user@engzone.com", hashUser, "user"]);
  }

  // Clear existing data
  db.run("DELETE FROM user_vocabulary");
  db.run("DELETE FROM user_progress");
  db.run("DELETE FROM exercises");
  db.run("DELETE FROM grammar_examples");
  db.run("DELETE FROM grammar_lessons");
  db.run("DELETE FROM vocabulary_words");
  db.run("DELETE FROM vocabulary_topics");

  // === VOCABULARY TOPICS & WORDS ===
  await insertTopicsAndWords(db);

  // === GRAMMAR LESSONS ===
  const grammarLessons = [
    {
      title: "Hiện tại đơn (Present Simple)",
      content: `The Present Simple is used for:
• Facts and general truths (The sun rises in the east)
• Habits and routines (I wake up at 7 AM)
• Scheduled events (The train leaves at 6 PM)

Structure:
• Positive: Subject + V(s/es) + Object
  - I/You/We/They → play
  - He/She/It → plays
• Negative: Subject + do/does + not + V
  - I do not (don't) like coffee
  - He does not (doesn't) eat meat
• Question: Do/Does + Subject + V?
   - Do you speak English?
   - Does she work here?

Dấu hiệu nhận biết: always, usually, often, sometimes, seldom, rarely, never, every (day/week/year), on (Mondays/weekends), once/twice a (week/month)`,
      level: "beginner",
      category: "Tenses",
      order_index: 1,
      examples: [
        { sentence: "She reads books every day.", translation: "Cô ấy đọc sách mỗi ngày.", explanation: "Habitual action in present" },
        { sentence: "Water boils at 100°C.", translation: "Nước sôi ở 100°C.", explanation: "Scientific fact / general truth" },
        { sentence: "They don't live in London.", translation: "Họ không sống ở London.", explanation: "Negative present simple" },
      ]
    },
    {
      title: "Hiện tại tiếp diễn (Present Continuous)",
      content: `The Present Continuous is used for:
• Actions happening now (I am reading now)
• Temporary situations (She is staying with friends)
• Future arrangements (We are meeting tomorrow)

Structure:
• Positive: Subject + am/is/are + V-ing
• Negative: Subject + am/is/are + not + V-ing
• Question: Am/Is/Are + Subject + V-ing?

Dấu hiệu nhận biết: now, right now, at the moment, at present, today, this week/month, Look!, Listen!, still`,
      level: "beginner",
      category: "Tenses",
      order_index: 2,
      examples: [
        { sentence: "I am studying English right now.", translation: "Tôi đang học tiếng Anh ngay bây giờ.", explanation: "Action in progress now" },
        { sentence: "They are building a new hospital.", translation: "Họ đang xây một bệnh viện mới.", explanation: "Temporary action happening around now" },
      ]
    },
    {
      title: "Quá khứ đơn (Past Simple)",
      content: `The Past Simple is used for:
• Completed actions in the past (I visited Hanoi yesterday)
• Past states (She lived in London for 5 years)
• A series of completed actions (He woke up, brushed his teeth, and had breakfast)

Structure:
• Positive: Subject + V2/ed + Object
  - I/You/He/She/It/We/They played / went
• Negative: Subject + did + not + V (bare infinitive)
  - I did not (didn't) go
• Question: Did + Subject + V (bare infinitive)?
  - Did you see her?

Dấu hiệu nhận biết: yesterday, last (night/week/month/year), ago, in (2020), the day before yesterday, this morning (when meaning is past), then, at that time`,
      level: "beginner",
      category: "Tenses",
      order_index: 5,
      examples: [
        { sentence: "I watched a movie last night.", translation: "Tôi đã xem một bộ phim tối qua.", explanation: "Completed action at a specific past time" },
        { sentence: "She went to Da Nang in 2022.", translation: "Cô ấy đã đi Đà Nẵng vào năm 2022.", explanation: "Specific past time with 'in 2022'" },
        { sentence: "He didn't eat breakfast this morning.", translation: "Anh ấy đã không ăn sáng sáng nay.", explanation: "Negative past simple" },
        { sentence: "Did you visit your grandparents yesterday?", translation: "Bạn đã thăm ông bà hôm qua phải không?", explanation: "Question in past simple" },
      ]
    },
    {
      title: "Quá khứ tiếp diễn (Past Continuous)",
      content: `The Past Continuous is used for:
• Actions in progress at a specific past time (I was watching TV at 8 PM)
• Interrupted actions (I was cooking when the phone rang)
• Parallel actions (She was reading while he was cooking)
• Background description in storytelling (The sun was shining, birds were singing...)

Structure:
• Positive: Subject + was/were + V-ing
  - I/He/She/It was working
  - We/You/They were working
• Negative: Subject + was/were + not + V-ing
  - I was not (wasn't) working
  - We were not (weren't) working
• Question: Was/Were + Subject + V-ing?
  - Were you sleeping?

Dấu hiệu nhận biết: at (5 PM) yesterday, at that time, while, when (một hành động đang xảy ra thì hành động khác xen vào), all (day/morning/evening), as`,
      level: "intermediate",
      category: "Tenses",
      order_index: 6,
      examples: [
        { sentence: "I was studying at 9 PM last night.", translation: "Tôi đang học lúc 9 giờ tối qua.", explanation: "Action in progress at a specific past time" },
        { sentence: "She was cooking dinner when I arrived.", translation: "Cô ấy đang nấu bữa tối thì tôi đến.", explanation: "Interrupted action with 'when'" },
        { sentence: "While I was reading, my brother was playing games.", translation: "Trong khi tôi đang đọc sách, em trai tôi đang chơi game.", explanation: "Two parallel actions in the past" },
      ]
    },
    {
      title: "Hiện tại hoàn thành (Present Perfect)",
      content: `The Present Perfect is used for:
• Past actions with present relevance (I have lost my keys — still missing)
• Life experiences (She has visited Japan twice)
• Actions that started in the past and continue to now (He has worked here since 2020)
• Recent past actions with present effect (I have just finished my homework)

Structure:
• Positive: Subject + have/has + V3/ed
  - I/You/We/They have seen
  - He/She/It has seen
• Negative: Subject + have/has + not + V3/ed
  - I have not (haven't) seen
  - He has not (hasn't) seen
• Question: Have/Has + Subject + V3/ed?
  - Have you ever been to Paris?

Dấu hiệu nhận biết: ever, never, already, just, yet, recently, lately, so far, up to now, until now, since (+ mốc thời gian), for (+ khoảng thời gian), this (week/month/year), once/twice/three times, the first/second time`,
      level: "intermediate",
      category: "Tenses",
      order_index: 3,
      examples: [
        { sentence: "I have visited Ha Long Bay three times.", translation: "Tôi đã thăm Vịnh Hạ Long ba lần.", explanation: "Experience - no specific time" },
        { sentence: "She has just finished her report.", translation: "Cô ấy vừa mới hoàn thành báo cáo.", explanation: "Recent past action with 'just'" },
        { sentence: "We have lived here since 2019.", translation: "Chúng tôi đã sống ở đây từ năm 2019.", explanation: "Action started in past and continues" },
        { sentence: "Have you ever tried pho?", translation: "Bạn đã từng ăn phở chưa?", explanation: "Question about life experience" },
      ]
    },
    {
      title: "Hiện tại hoàn thành tiếp diễn (Present Perfect Continuous)",
      content: `The Present Perfect Continuous is used for:
• Actions that started in the past and continue to now (I have been studying for 3 hours)
• Actions that recently stopped with visible results (You're wet — have you been running?)
• Emphasizing the duration of an action (She has been working here since 2018)

Structure:
• Positive: Subject + have/has + been + V-ing
  - I/You/We/They have been waiting
  - He/She/It has been waiting
• Negative: Subject + have/has + not + been + V-ing
  - I have not (haven't) been waiting
  - He has not (hasn't) been waiting
• Question: Have/Has + Subject + been + V-ing?
  - Have you been waiting long?

Dấu hiệu nhận biết: for (+ khoảng thời gian), since (+ mốc thời gian), all (day/morning/week), how long, lately, recently`,
      level: "intermediate",
      category: "Tenses",
      order_index: 4,
      examples: [
        { sentence: "She has been studying English for 2 hours.", translation: "Cô ấy đã học tiếng Anh được 2 tiếng rồi.", explanation: "Action continuing from past to present" },
        { sentence: "You look tired. Have you been working hard?", translation: "Bạn trông mệt mỏi quá. Bạn đã làm việc vất vả phải không?", explanation: "Visible result of recent action" },
        { sentence: "They have been building this bridge since last year.", translation: "Họ đã xây cây cầu này từ năm ngoái.", explanation: "Emphasizing duration" },
      ]
    },
    {
      title: "Quá khứ hoàn thành (Past Perfect)",
      content: `The Past Perfect is used for:
• Actions completed before another past action (I had already eaten when she arrived)
• Actions completed before a specific time in the past (She had finished by 5 PM)
• The "earlier past" in storytelling (He had never seen such a beautiful place before)

Structure:
• Positive: Subject + had + V3/ed
  - I/You/He/She/It/We/They had left
• Negative: Subject + had + not + V3/ed
  - I had not (hadn't) left
• Question: Had + Subject + V3/ed?
  - Had you finished before they came?

Dấu hiệu nhận biết: already, just, never, by the time (+ mệnh đề), before, after, until, when (nhấn mạnh hành động xảy ra trước), by (+ thời gian)`,
      level: "intermediate",
      category: "Tenses",
      order_index: 7,
      examples: [
        { sentence: "When I arrived, the train had already left.", translation: "Khi tôi đến, tàu đã rời đi rồi.", explanation: "Past action completed before another past action" },
        { sentence: "She had finished her homework before dinner.", translation: "Cô ấy đã làm xong bài tập trước bữa tối.", explanation: "Action completed before a past time" },
        { sentence: "He had never flown before his trip last year.", translation: "Anh ấy chưa từng đi máy bay trước chuyến đi năm ngoái.", explanation: "Earlier past experience" },
      ]
    },
    {
      title: "Quá khứ hoàn thành tiếp diễn (Past Perfect Continuous)",
      content: `The Past Perfect Continuous is used for:
• Actions that had been in progress before another past action (She had been waiting for an hour before he arrived)
• Cause of a past state (He was tired because he had been working all day)
• Emphasizing duration before a past moment (They had been traveling for 6 hours by noon)

Structure:
• Positive: Subject + had + been + V-ing
  - I/You/He/She/It/We/They had been waiting
• Negative: Subject + had + not + been + V-ing
  - I had not (hadn't) been waiting
• Question: Had + Subject + been + V-ing?
  - Had you been waiting long?

Dấu hiệu nhận biết: before, after, by the time, for (+ khoảng thời gian), since (+ mốc thời gian), how long, all (day/morning/week), by (+ thời gian)`,
      level: "advanced",
      category: "Tenses",
      order_index: 8,
      examples: [
        { sentence: "She had been studying for 3 hours before she took a break.", translation: "Cô ấy đã học được 3 tiếng trước khi nghỉ giải lao.", explanation: "Duration before a past action" },
        { sentence: "He failed the exam because he hadn't been studying enough.", translation: "Anh ấy đã trượt kỳ thi vì đã không học đủ.", explanation: "Cause of a past result" },
        { sentence: "They had been traveling for 12 hours before they finally arrived.", translation: "Họ đã đi du lịch được 12 tiếng trước khi cuối cùng đến nơi.", explanation: "Emphasizing duration" },
      ]
    },
    {
      title: "Câu điều kiện (Conditional Sentences)",
      content: `Zero Conditional (General truth):
• If + Present Simple, Present Simple
• If you heat ice, it melts.

First Conditional (Real future):
• If + Present Simple, will + V
• If it rains, I will stay home.

Second Conditional (Unreal present):
• If + Past Simple, would + V
• If I were rich, I would travel the world.

Third Conditional (Unreal past):
• If + Past Perfect, would have + V3
• If I had studied, I would have passed.

Dấu hiệu nhận biết: if, unless, provided (that), as long as, in case, even if — kết hợp với thì tương ứng`,
      level: "intermediate",
      category: "Conditionals",
      order_index: 13,
      examples: [
        { sentence: "If I were you, I would accept the offer.", translation: "Nếu tôi là bạn, tôi sẽ chấp nhận lời đề nghị.", explanation: "Second conditional - unreal present situation" },
        { sentence: "If she studies hard, she will pass the exam.", translation: "Nếu cô ấy học chăm chỉ, cô ấy sẽ đỗ kỳ thi.", explanation: "First conditional - real future possibility" },
        { sentence: "If he had left earlier, he wouldn't have missed the bus.", translation: "Nếu anh ấy đi sớm hơn, anh ấy đã không lỡ xe buýt.", explanation: "Third conditional - unreal past" },
      ]
    },
    {
      title: "Câu bị động (Passive Voice)",
      content: `The Passive Voice is used when:
• The action is more important than the doer
• The doer is unknown or obvious
• Formal/academic writing

Structure: Subject + be + V3 (by agent)

Tenses in Passive:
• Present Simple: is/am/are + V3
• Past Simple: was/were + V3
• Present Perfect: have/has been + V3
• Future: will be + V3
• Modals: can/must/should be + V3

Dấu hiệu nhận biết: chủ ngữ không xác định hoặc không quan trọng (by someone, by people, by them), hành động được nhấn mạnh hơn người thực hiện, văn phong trang trọng`,
      level: "intermediate",
      category: "Voice",
      order_index: 14,
      examples: [
        { sentence: "The report was written by the manager.", translation: "Báo cáo đã được viết bởi quản lý.", explanation: "Past Simple Passive" },
        { sentence: "English is spoken worldwide.", translation: "Tiếng Anh được nói trên toàn thế giới.", explanation: "Present Simple Passive - doer is irrelevant" },
        { sentence: "The meeting has been postponed.", translation: "Cuộc họp đã bị hoãn lại.", explanation: "Present Perfect Passive" },
      ]
    },
    {
      title: "Câu tường thuật (Reported Speech)",
      content: `Reported Speech is used to report what someone said without quoting directly.

Key changes when reporting:
• Pronouns change (I → he/she)
• Tenses go back one step:
  - Present Simple → Past Simple
  - Present Continuous → Past Continuous
  - Past Simple → Past Perfect
  - Will → Would
  - Can → Could
• Time/place words change:
  - now → then
  - today → that day
  - here → there
  - tomorrow → the next day

Structure: He said (that) + clause

Dấu hiệu nhận biết: các động từ tường thuật (reporting verbs): say, tell, ask, explain, mention, claim, report, state, announce; các từ chuyển đổi thời gian: now→then, today→that day, tomorrow→the next day, yesterday→the day before, here→there`,
      level: "advanced",
      category: "Speech",
      order_index: 15,
      examples: [
        { sentence: 'She said, "I am tired." → She said that she was tired.', translation: "Cô ấy nói rằng cô ấy mệt.", explanation: "Present → Past tense backshift" },
        { sentence: '"I will call you tomorrow" → He said he would call me the next day.', translation: "Anh ấy nói sẽ gọi tôi vào ngày hôm sau.", explanation: "Will → Would, tomorrow → the next day" },
      ]
    },
    {
      title: "Thể giả định (Subjunctive Mood)",
      content: `The Subjunctive Mood is used for:
• Wishes (I wish I were...)
• Suggestions (I suggest that he study...)
• Demands/Recommendations (It is essential that she be...)
• After "if only" (If only I knew...)

Key rules:
• "Were" is used for all persons (I wish I were... not "was")
• Verbs remain in base form (I suggest he go... not "goes")
• Common with: suggest, recommend, demand, insist, propose

Dấu hiệu nhận biết: wish, if only, would rather, as if/as though, suggest, recommend, demand, insist, propose, urge; các cấu trúc "It is + adj + that...": essential, important, necessary, vital`,
      level: "advanced",
      category: "Mood",
      order_index: 16,
      examples: [
        { sentence: "I wish I were rich.", translation: "Tôi ước gì mình giàu.", explanation: "Subjunctive after 'wish' - unreal present" },
        { sentence: "I suggest that he study harder.", translation: "Tôi đề nghị anh ấy học chăm chỉ hơn.", explanation: "Subjunctive after 'suggest' - base form 'study'" },
        { sentence: "It is essential that every student be present.", translation: "Điều cần thiết là mọi học sinh phải có mặt.", explanation: "Subjunctive after 'essential' - base form 'be'" },
      ]
    },
    {
      title: "Tương lai đơn (Future Simple)",
      content: `The Future Simple is used for:
• Predictions (It will rain tomorrow)
• Spontaneous decisions (I'll answer the phone)
• Promises, offers, threats (I will help you with that)
• Planned intentions with "going to" (She is going to study abroad)

Structure with Will:
• Positive: Subject + will + V (bare infinitive)
  - I/You/He/She/It/We/They will go
• Negative: Subject + will + not + V
  - I will not (won't) go
• Question: Will + Subject + V?
  - Will you come?

Structure with Be Going To:
• Positive: Subject + am/is/are + going to + V
  - I am going to study
  - She is going to travel
• Negative: Subject + am/is/are + not + going to + V
  - I am not going to go
• Question: Am/Is/Are + Subject + going to + V?
  - Are you going to apply for that job?

Dấu hiệu nhận biết: tomorrow, next (week/month/year), soon, in the future, tonight, this weekend, I think/I hope/I promise/I expect, probably, definitely, maybe`,
      level: "beginner",
      category: "Tenses",
      order_index: 9,
      examples: [
        { sentence: "I will call you later.", translation: "Tôi sẽ gọi bạn sau.", explanation: "Promise with 'will'" },
        { sentence: "She is going to study medicine at university.", translation: "Cô ấy dự định học y khoa ở đại học.", explanation: "Planned intention with 'going to'" },
        { sentence: "Look at those dark clouds! It's going to rain.", translation: "Nhìn những đám mây đen kìa! Trời sắp mưa.", explanation: "Prediction with evidence" },
        { sentence: "Will you come to my birthday party?", translation: "Bạn sẽ đến bữa tiệc sinh nhật của tôi chứ?", explanation: "Question about future" },
      ]
    },
    {
      title: "Tương lai tiếp diễn (Future Continuous)",
      content: `The Future Continuous is used for:
• Actions in progress at a specific future time (I will be flying to Hanoi at 8 PM tomorrow)
• Actions that will happen as part of a normal routine (I will be working as usual)
• Polite inquiries (Will you be using the car tonight?)
• Parallel actions in the future (She will be cooking while I will be cleaning)

Structure:
• Positive: Subject + will + be + V-ing
  - I/You/He/She/It/We/They will be working
• Negative: Subject + will + not + be + V-ing
  - I will not (won't) be working
• Question: Will + Subject + be + V-ing?
  - Will you be coming to the meeting?

Dấu hiệu nhận biết: this time tomorrow/next week, at (5 PM) tomorrow, in the coming years, when (+ mệnh đề ở hiện tại), by this time next (week/month/year)`,
      level: "intermediate",
      category: "Tenses",
      order_index: 10,
      examples: [
        { sentence: "This time next week, I will be lying on the beach.", translation: "Giờ này tuần sau, tôi sẽ đang nằm trên bãi biển.", explanation: "Action in progress at a specific future time" },
        { sentence: "Will you be using the computer later?", translation: "Bạn sẽ dùng máy tính sau chứ?", explanation: "Polite inquiry about future plans" },
        { sentence: "When you arrive, I will be waiting for you at the airport.", translation: "Khi bạn đến, tôi sẽ đang đợi bạn ở sân bay.", explanation: "Action in progress when another happens" },
      ]
    },
    {
      title: "Tương lai hoàn thành (Future Perfect)",
      content: `The Future Perfect is used for:
• Actions that will be completed before a specific future time (She will have finished by 5 PM)
• Actions completed before another future action (I will have eaten before you arrive)
• Duration by a certain future point (By next year, I will have lived here for 10 years)

Structure:
• Positive: Subject + will + have + V3/ed
  - I/You/He/She/It/We/They will have finished
• Negative: Subject + will + not + have + V3/ed
  - I will not (won't) have finished
• Question: Will + Subject + have + V3/ed?
  - Will you have finished by then?

Dấu hiệu nhận biết: by (+ thời gian), by the time (+ mệnh đề), before (+ thời gian), by then, by next (week/month/year), when (đã hoàn thành trước)`,
      level: "advanced",
      category: "Tenses",
      order_index: 11,
      examples: [
        { sentence: "By 2030, I will have graduated from university.", translation: "Đến năm 2030, tôi sẽ đã tốt nghiệp đại học.", explanation: "Completed action by a future time" },
        { sentence: "She will have finished the report before the meeting starts.", translation: "Cô ấy sẽ đã hoàn thành báo cáo trước khi cuộc họp bắt đầu.", explanation: "Completed before another future action" },
        { sentence: "Will you have completed the project by the deadline?", translation: "Bạn sẽ đã hoàn thành dự án trước hạn chót chứ?", explanation: "Question about completion by a future time" },
      ]
    },
    {
      title: "Tương lai hoàn thành tiếp diễn (Future Perfect Continuous)",
      content: `The Future Perfect Continuous is used for:
• Actions that will have been in progress for a duration before a specific future time (By December, I will have been working here for 5 years)
• Emphasizing duration before a future moment (She will have been studying for 6 hours by the time the exam starts)
• Projecting ongoing actions (By next summer, they will have been building this bridge for 3 years)

Structure:
• Positive: Subject + will + have + been + V-ing
  - I/You/He/She/It/We/They will have been working
• Negative: Subject + will + not + have + been + V-ing
  - I will not (won't) have been working
• Question: Will + Subject + have + been + V-ing?
  - Will you have been waiting long?

Dấu hiệu nhận biết: by (+ thời gian), by the time (+ mệnh đề), for (+ khoảng thời gian), since (+ mốc thời gian), by next (week/month/year)`,
      level: "advanced",
      category: "Tenses",
      order_index: 12,
      examples: [
        { sentence: "By next June, I will have been teaching for 10 years.", translation: "Đến tháng Sáu năm sau, tôi sẽ đã dạy học được 10 năm.", explanation: "Duration before a future time" },
        { sentence: "She will have been working on this project for 6 months by the end of this week.", translation: "Cô ấy sẽ đã làm việc trên dự án này được 6 tháng vào cuối tuần này.", explanation: "Emphasizing duration before a future moment" },
        { sentence: "Will you have been waiting long when I arrive?", translation: "Bạn sẽ đã đợi lâu khi tôi đến chứ?", explanation: "Question about future perfect continuous" },
      ]
    },
    {
      title: "Mạo từ (Articles: A/An/The)",
      content: `Articles are used before nouns.

Indefinite Articles (A/An):
• A + consonant sound: a book, a university, a cat
• An + vowel sound: an apple, an hour, an honest man
• Use for non-specific items or first mention
  - I saw a dog. (any dog, first time mentioned)
  - She is a teacher. (describing profession)

Definite Article (The):
• Specific items or already mentioned
  - The dog I saw was brown. (specific dog)
• Unique things: the sun, the moon, the Earth
• Superlatives: the best, the most beautiful
• Musical instruments: play the piano, the guitar
• Ordinal numbers: the first, the second

Zero Article (No article):
• General plurals: Cats are animals.
• Uncountable nouns (general): Water is essential.
• Proper nouns: I live in Vietnam.
• Meals: have breakfast, lunch, dinner
• Sports: play football, tennis

Dấu hiệu nhận biết:
• A/An: lần đầu nhắc đến, danh từ đếm được số ít chưa xác định
• The: đã nhắc đến trước đó, duy nhất, so sánh nhất, số thứ tự
• Không mạo từ: danh từ số nhiều chung chung, danh từ không đếm được, tên riêng, bữa ăn, môn thể thao`,
      level: "beginner",
      category: "Grammar",
      order_index: 17,
      examples: [
        { sentence: "I bought a car yesterday. The car is red.", translation: "Tôi đã mua một chiếc xe hơi hôm qua. Chiếc xe màu đỏ.", explanation: "'A' for first mention, 'the' for specific reference" },
        { sentence: "She is an engineer.", translation: "Cô ấy là một kỹ sư.", explanation: "'An' before vowel sound in 'engineer'" },
        { sentence: "The sun rises in the east.", translation: "Mặt trời mọc ở phía đông.", explanation: "'The' for unique things (sun, east)" },
        { sentence: "I love music.", translation: "Tôi yêu âm nhạc.", explanation: "Zero article for general uncountable nouns" },
      ]
    },
    {
      title: "Giới từ chỉ thời gian & nơi chốn (Prepositions of Time & Place)",
      content: `Prepositions of Time:

AT: specific times, holidays, night
• at 5 o'clock, at midnight, at night, at Christmas
• at the moment, at present

IN: months, years, seasons, longer periods
• in January, in 2024, in summer, in the morning
• in the past, in the future

ON: days, dates, surfaces
• on Monday, on July 4th, on my birthday
• on the table, on the wall

Prepositions of Place:

AT: specific points/positions
• at the bus stop, at the door, at the desk
• at home, at work, at school

IN: enclosed spaces, areas
• in the room, in the garden, in the city
• in the world, in a book

ON: surfaces, lines
• on the floor, on the page, on the left
• on a bus, on a train, on TV

BY: next to, near
• Sit by me. / The house by the river.
• by bus, by car (method of transport)

Dấu hiệu nhận biết:
• AT + giờ cụ thể / địa điểm cụ thể: at 5 o'clock, at night, at the door, at work
• IN + tháng/năm/mùa / không gian kín: in May, in 2024, in summer, in the room, in the city
• ON + ngày/bề mặt: on Monday, on July 4th, on the table, on the floor
• BY + phương tiện / bên cạnh: by car, by bus, sit by me`,
      level: "beginner",
      category: "Grammar",
      order_index: 18,
      examples: [
        { sentence: "I wake up at 7 AM in the morning.", translation: "Tôi thức dậy lúc 7 giờ sáng.", explanation: "AT for specific time, IN for part of day" },
        { sentence: "My birthday is on March 15th.", translation: "Sinh nhật của tôi vào ngày 15 tháng 3.", explanation: "ON for specific dates" },
        { sentence: "She is waiting at the bus stop.", translation: "Cô ấy đang đợi ở trạm xe buýt.", explanation: "AT for a specific location point" },
        { sentence: "The cat is on the table.", translation: "Con mèo ở trên bàn.", explanation: "ON for surfaces" },
      ]
    },
    {
      title: "Mệnh đề quan hệ (Relative Clauses)",
      content: `Relative clauses give more information about a noun.

Defining Relative Clauses (essential information):
• Who/That → people: The woman who lives next door is a doctor.
• Which/That → things: The book which I read was great.
• Where → places: This is the house where I grew up.
• When → time: I remember the day when we met.
• Whose → possession: The man whose car was stolen called the police.

Non-defining Relative Clauses (extra information, with commas):
• The Eiffel Tower, which is in Paris, is beautiful.
• My sister, who lives in London, is a lawyer.

Note: 'That' CANNOT be used in non-defining clauses.
Omission of relative pronouns:
• When the relative pronoun is the object, it can be omitted:
   - The book (that/which) I read was interesting.

Dấu hiệu nhận biết: who (người), which (vật), that (cả người và vật - không dùng trong mệnh đề không xác định), whose (sở hữu), where (nơi chốn), when (thời gian), why (lý do)`,
      level: "intermediate",
      category: "Grammar",
      order_index: 19,
      examples: [
        { sentence: "The student who studies hard will pass.", translation: "Học sinh nào học chăm chỉ sẽ đỗ.", explanation: "Defining clause with 'who' for people" },
        { sentence: "The car which I bought is very fast.", translation: "Chiếc xe tôi mua rất nhanh.", explanation: "Defining clause with 'which' for things" },
        { sentence: "My mother, who is 60, still works every day.", translation: "Mẹ tôi, người 60 tuổi, vẫn làm việc mỗi ngày.", explanation: "Non-defining clause with commas" },
        { sentence: "The house where I was born is now a museum.", translation: "Ngôi nhà nơi tôi sinh ra nay là bảo tàng.", explanation: "'Where' for places" },
      ]
    },
    {
      title: "So sánh hơn & so sánh nhất (Comparatives & Superlatives)",
      content: `Used to compare things.

Comparatives (comparing two things):
• Short adjectives (1-2 syllables): adjective + -er + than
  - tall → taller than, big → bigger than, happy → happier than
• Long adjectives (2+ syllables): more + adjective + than
  - more beautiful than, more interesting than
• Irregular:
  - good → better than, bad → worse than, far → farther/further than

Superlatives (comparing three or more):
• the + short adjective + -est
  - the tallest, the biggest, the happiest
• the most + long adjective
  - the most beautiful, the most expensive
• Irregular:
  - the best, the worst, the farthest/furthest

As...as (equal comparison):
• She is as tall as her brother.
• He is not as smart as his sister.

Less / The least (decreasing comparison):
• This book is less expensive than that one.
• This is the least interesting movie I've seen.

Dấu hiệu nhận biết:
• So sánh hơn: than, much/far/a lot + comparative, a little/a bit + comparative, even/still + comparative
• So sánh nhất: the + -est / the most, in + nhóm, of all, ever, one of the
• So sánh bằng: as...as, not so/as...as
• So sánh kém: less...than, the least`,
      level: "intermediate",
      category: "Grammar",
      order_index: 20,
      examples: [
        { sentence: "This car is faster than that one.", translation: "Chiếc xe này nhanh hơn chiếc kia.", explanation: "Comparative with short adjective 'fast'" },
        { sentence: "She is the most intelligent student in the class.", translation: "Cô ấy là học sinh thông minh nhất trong lớp.", explanation: "Superlative with long adjective 'intelligent'" },
        { sentence: "My brother is as tall as my father.", translation: "Anh trai tôi cao bằng bố tôi.", explanation: "Equal comparison with 'as...as'" },
        { sentence: "This is the best pizza I have ever eaten!", translation: "Đây là pizza ngon nhất tôi từng ăn!", explanation: "Irregular superlative 'the best'" },
      ]
    },
    {
      title: "Động từ khiếm khuyết (Modal Verbs)",
      content: `Modal verbs are auxiliary verbs that express necessity, possibility, permission, or ability.

Can / Could:
• Ability: I can swim. / I could swim when I was 5.
• Permission: Can I go out? / Could I borrow your pen? (polite)
• Possibility: It can be cold in winter. / It could rain later.

May / Might:
• Permission (formal): May I come in?
• Possibility (50% or less): It may rain. / It might snow.

Must / Have to:
• Necessity/Obligation: You must wear a seatbelt. / I have to work.
• Prohibition: You must not smoke here.
• No necessity (don't have to): You don't have to come if you don't want.

Should / Ought to:
• Advice/Recommendation: You should see a doctor.
• Expectation: The train should arrive soon.

Will / Would:
• Future: I will call you.
• Requests: Would you help me?
• Polite offers: Would you like some tea?

Dấu hiệu nhận biết:
• Can/Could: ability, permission, possibility, polite requests
• May/Might: formal permission, possibility (~50% or less)
• Must/Have to: obligation, necessity, strong advice, prohibition (must not)
• Should/Ought to: advice, recommendation, expectation
• Will/Would: future, promises, requests, polite offers
• Needn't / Don't have to: không cần thiết (≠ must not)`,
      level: "intermediate",
      category: "Grammar",
      order_index: 21,
      examples: [
        { sentence: "You must wear a helmet when riding a motorcycle.", translation: "Bạn phải đội mũ bảo hiểm khi đi xe máy.", explanation: "'Must' for strong obligation/rule" },
        { sentence: "She can speak three languages fluently.", translation: "Cô ấy có thể nói thông thạo ba thứ tiếng.", explanation: "'Can' for ability" },
        { sentence: "You should exercise regularly to stay healthy.", translation: "Bạn nên tập thể dục thường xuyên để giữ sức khỏe.", explanation: "'Should' for advice" },
        { sentence: "It might rain later, so bring an umbrella.", translation: "Trời có thể mưa sau đó, nên mang ô nhé.", explanation: "'Might' for possibility (~30-50% chance)" },
      ]
    },
    {
      title: "Danh động từ & Động từ nguyên mẫu (Gerunds & Infinitives)",
      content: `Gerund: V-ing (functions as a noun)
• Subject: Swimming is good exercise.
• After prepositions: Thank you for helping me.
• After certain verbs: enjoy, avoid, mind, suggest, quit, practice
  - I enjoy reading. / She avoids eating junk food.
• After go for activities: go shopping, go swimming, go running

Infinitive: to + V (base verb)
• Purpose: I called to invite you.
• After certain verbs: want, need, hope, plan, decide, promise
  - I want to learn English. / We plan to travel.
• After adjectives: It's important to study. / She is happy to help.
• After too/enough: too young to drive, old enough to vote

Verbs that change meaning:
• Remember/Forget + gerund: remembering a past action
  - I remember locking the door. (I did it, I recall)
• Remember/Forget + infinitive: remembering to do something
  - Remember to lock the door. (don't forget!)
• Stop + gerund: quit an action
  - I stopped smoking. (I quit)
• Stop + infinitive: pause to do something
   - I stopped to smoke. (I paused what I was doing to smoke)

Dấu hiệu nhận biết:
• Động từ + Gerund: enjoy, avoid, mind, suggest, quit, practice, finish, consider, admit, deny, imagine, miss, risk
• Động từ + To-infinitive: want, need, hope, plan, decide, promise, expect, agree, offer, refuse, learn, manage, afford
• Động từ + cả hai (nghĩa thay đổi): remember, forget, stop, try, regret, go on
• Giới từ + Gerund: interested in, good at, fond of, before, after, without, for, about
• Cụm từ: it's worth, can't help, can't stand, look forward to, feel like, spend time, waste time`,
      level: "advanced",
      category: "Grammar",
      order_index: 22,
      examples: [
        { sentence: "I enjoy listening to music while working.", translation: "Tôi thích nghe nhạc trong khi làm việc.", explanation: "'Enjoy' followed by gerund" },
        { sentence: "She decided to study abroad.", translation: "Cô ấy quyết định đi du học.", explanation: "'Decide' followed by infinitive" },
        { sentence: "I stopped smoking last year.", translation: "Tôi đã bỏ hút thuốc năm ngoái.", explanation: "'Stop + gerund' means quit an action" },
        { sentence: "Swimming is a great form of exercise.", translation: "Bơi lội là một hình thức tập thể dục tuyệt vời.", explanation: "Gerund as subject of sentence" },
      ]
    },
    {
      title: "Cụm động từ (Phrasal Verbs)",
      content: `Phrasal verbs = verb + particle (preposition/adverb)
The meaning is often different from the original verb.

Types of Phrasal Verbs:

1. Intransitive (no object):
   • The plane took off. / Please sit down.
   • The car broke down. / She showed up late.

2. Separable (object can go between verb and particle):
   • Turn off the light. / Turn the light off.
   • Put on your coat. / Put your coat on.
   • Take back what you said. / Take it back.

3. Inseparable (object must go after the particle):
   • Look after the children. (NOT Look the children after)
   • I ran into an old friend. / She gets along with everyone.
   • He takes after his father. (resembles)

Common phrasal verbs:
• Give up = quit: I gave up smoking.
• Look up = search: Look up the word in a dictionary.
• Put off = postpone: Don't put off your homework.
• Get over = recover: She got over the flu.
• Look forward to = anticipate: I look forward to meeting you.
• Come up with = create/think of: He came up with a great idea.

Dấu hiệu nhận biết:
• Động từ + giới từ/trạng từ, nghĩa thường khác với động từ gốc
• Có thể tách rời (separable): turn off, put on, take off, give back, throw away — danh từ có thể ở giữa hoặc sau, đại từ bắt buộc ở giữa
• Không tách rời (inseparable): look after, run into, get along with, take after, look forward to, come up with
• Nội động từ (không tân ngữ): grow up, show up, break down, take off (máy bay cất cánh)`,
      level: "advanced",
      category: "Vocabulary",
      order_index: 23,
      examples: [
        { sentence: "Please turn off the lights when you leave.", translation: "Làm ơn tắt đèn khi bạn rời đi.", explanation: "Separable phrasal verb 'turn off'" },
        { sentence: "I ran into my teacher at the supermarket.", translation: "Tôi tình cờ gặp giáo viên ở siêu thị.", explanation: "Inseparable phrasal verb 'run into' = meet by chance" },
        { sentence: "She gave up sugar for health reasons.", translation: "Cô ấy đã từ bỏ đường vì lý do sức khỏe.", explanation: "'Give up' = quit/stop doing something" },
        { sentence: "I am looking forward to the weekend.", translation: "Tôi đang mong chờ đến cuối tuần.", explanation: "'Look forward to' = anticipate with pleasure" },
      ]
    },
    {
      title: "Từ nối (Linking Words & Connectors)",
      content: `Linking words connect ideas, sentences, and paragraphs.

Addition:
• And, also, too, as well, moreover, furthermore, in addition
  - She is smart and hardworking.
  - Moreover, the research was thorough.

Contrast:
• But, however, although, even though, whereas, while, on the other hand
  - Although it rained, we enjoyed the trip.
  - He is rich whereas his brother is poor.

Cause & Effect:
• Because, since, as, therefore, consequently, thus, as a result
  - She passed because she studied hard.
  - The flight was delayed; therefore, we missed the connection.

Purpose:
• To, in order to, so as to, so that
  - I study hard to get a good job.
  - She left early so that she wouldn't be late.

Sequence:
• First, then, next, after that, finally, meanwhile, subsequently
  - First, prepare the ingredients. Then, mix them together.

Condition:
• If, unless, provided that, as long as, in case
  - You can go out provided that you finish your homework.

Concession:
• Although, despite, in spite of, nevertheless, nonetheless
  - Despite the rain, we went for a walk.

Dấu hiệu nhận biết:
• Addition: besides, moreover, furthermore, in addition, not only...but also, what's more
• Contrast: but, however, although, even though, whereas, while, on the other hand, nevertheless, nonetheless, yet
• Cause & Effect: because, since, as, therefore, consequently, thus, hence, as a result, due to, owing to
• Purpose: to, in order to, so as to, so that, for the purpose of
• Sequence: first/firstly, second/secondly, then, next, after that, finally, eventually, meanwhile, subsequently
• Condition: if, unless, provided that, as long as, in case, on condition that, otherwise
• Concession: although, despite, in spite of, nevertheless, nonetheless, admittedly, granted that`,
      level: "advanced",
      category: "Writing",
      order_index: 24,
      examples: [
        { sentence: "Although he was tired, he finished his work.", translation: "Mặc dù mệt, anh ấy vẫn hoàn thành công việc.", explanation: "'Although' for contrast/concession" },
        { sentence: "She studied hard; therefore, she got excellent grades.", translation: "Cô ấy học chăm chỉ; do đó, cô ấy đạt điểm xuất sắc.", explanation: "'Therefore' for cause and effect" },
        { sentence: "I will go to the party provided that I finish my homework.", translation: "Tôi sẽ đi dự tiệc với điều kiện là tôi làm xong bài tập.", explanation: "'Provided that' for condition" },
        { sentence: "He is very funny whereas his brother is serious.", translation: "Anh ấy rất hài hước trong khi anh trai thì nghiêm túc.", explanation: "'Whereas' for direct contrast" },
      ]
    },
    {
      title: "Đảo ngữ & Nhấn mạnh (Inversion & Emphasis)",
      content: `Inversion is used for emphasis, often in formal/academic English.

After negative adverbials:
• Never have I seen such beauty.
• Rarely does she complain.
• Not only did he finish, but he also excelled.
• Under no circumstances should you lie.

After "Only":
• Only then did I understand.
• Only by working hard can you succeed.

After "So" / "Such":
• So beautiful was the view that we stopped.
• Such was his anger that he couldn't speak.

Dấu hiệu nhận biết: các từ/cụm từ sau đây thường đứng đầu câu và gây đảo ngữ:
• Phủ định: never, rarely, seldom, hardly, barely, scarcely, no sooner...than, not only...but also
• Only: only then, only when, only after, only by, only if
• So/Such: so...that, such...that
• At no time, under no circumstances, in no way, on no account
• Not until, not a single
• Câu điều kiện đảo: Were I..., Had I..., Should I...`,
      level: "advanced",
      category: "Style",
      order_index: 25,
      examples: [
        { sentence: "Never have I witnessed such dedication.", translation: "Chưa bao giờ tôi chứng kiến sự cống hiến như vậy.", explanation: "Inversion after negative adverbial 'never'" },
        { sentence: "Not only does she speak English, but she also writes poetry.", translation: "Cô ấy không chỉ nói tiếng Anh mà còn làm thơ.", explanation: "Inversion with 'not only... but also'" },
        { sentence: "Only when I graduated did I realize the value of education.", translation: "Chỉ khi tốt nghiệp tôi mới nhận ra giá trị của giáo dục.", explanation: "Inversion after 'only when'" },
      ]
    },
    // === NEW ADVANCED LESSONS ===
    {
      title: "Câu chẻ (Cleft Sentences)",
      content: `Cleft sentences divide a simple sentence into two parts for emphasis.

IT-cleft: It + be + emphasized part + that/who + rest
• It was John who called you. (not someone else)
• It is English that I want to learn. (not another language)
• It was yesterday that she left. (not another day)

WH-cleft / Pseudo-cleft:
• What I need is a holiday.
• What she did was quit her job.
• The reason why he left was that he was tired.

Cleft sentences are common in formal/academic English to:
• Emphasize a specific element
• Contrast information
• Create a dramatic effect

Dấu hiệu nhận biết: "It is/was + ... + that/who" (IT-cleft) hoặc "What + ... + is/was + ..." (WH-cleft) — dùng để nhấn mạnh một thành phần trong câu`,
      level: "advanced",
      category: "Style",
      order_index: 26,
      examples: [
        { sentence: "It was Maria who won the first prize.", translation: "Chính Maria là người đã giành giải nhất.", explanation: "IT-cleft emphasizes the subject 'Maria'" },
        { sentence: "What I really need is a good rest.", translation: "Điều tôi thực sự cần là một kỳ nghỉ ngơi tốt.", explanation: "WH-cleft emphasizes the noun phrase after 'is'" },
        { sentence: "It was because of the traffic that we were late.", translation: "Chính vì kẹt xe mà chúng tôi đã đến trễ.", explanation: "IT-cleft emphasizing a reason/adverbial clause" },
      ]
    },
    {
      title: "Câu điều kiện hỗn hợp (Mixed Conditionals)",
      content: `Mixed conditionals combine different conditional types.

Type 1: Past condition → Present result
• Describes a past action that affects the present
• If + Past Perfect (had + V3), would + V
• If I had studied medicine, I would be a doctor now.
  (I didn't study medicine in the past → I'm not a doctor now)

Type 2: General truth → Past result
• If + Past Simple, would have + V3
• If I were smarter, I would have passed the exam.
  (I'm not smart in general → I didn't pass in the past)

Comparison with standard conditionals:
• Third: If I had studied, I would have passed. (pure past)
• Mixed: If I had studied, I would be a doctor now. (past→present)
• Second: If I were rich, I would travel. (pure present)
• Mixed: If I were rich, I would have bought that house. (present→past)

Dấu hiệu nhận biết: kết hợp 2 mốc thời gian khác nhau trong cùng câu — mệnh đề if ở một thì (quá khứ hoặc hiện tại), mệnh đề chính ở thì khác. Phân biệt với câu điều kiện chuẩn (cùng thời gian).`,
      level: "advanced",
      category: "Conditionals",
      order_index: 27,
      examples: [
        { sentence: "If I had taken that job, I would be living in London now.", translation: "Nếu tôi đã nhận công việc đó, bây giờ tôi đang sống ở London.", explanation: "Mixed conditional: past condition → present result" },
        { sentence: "If she weren't so shy, she would have spoken up.", translation: "Nếu cô ấy không quá nhút nhát, cô ấy đã lên tiếng rồi.", explanation: "Mixed conditional: present trait → past result" },
        { sentence: "If he had saved money, he wouldn't be in debt now.", translation: "Nếu anh ấy đã tiết kiệm tiền, bây giờ anh ấy không mắc nợ.", explanation: "Mixed conditional: past action → present situation" },
      ]
    },
    {
      title: "Thể sai khiến (Causative Form)",
      content: `The causative is used when you arrange for someone else to do something for you.

Have something done:
• Subject + have + object + V3 (past participle)
• I had my car repaired. (I paid someone to repair it)
• She is having her hair cut. (someone is cutting it)
• We will have the house painted next month.

Get something done (more informal):
• Subject + get + object + V3
• I need to get my phone fixed.
• She got her nails done yesterday.

Active causative (make someone do):
• Subject + make + person + V
• The teacher made us rewrite the essay.
• My mom made me clean my room.

Active causative (have someone do):
• Subject + have + person + V
• I had the technician check my computer.
• She had her assistant book the tickets.

Common uses:
• Services: haircut, car repair, house cleaning
• Professional work: legal documents, medical checkups

Dấu hiệu nhận biết: have/get + tân ngữ + V3 (nhờ ai làm gì) — chủ ngữ không trực tiếp làm hành động; make/have + người + V (bảo ai làm gì). Các dịch vụ thường gặp: cut hair, repair car, paint house, renew passport, clean clothes`,
      level: "advanced",
      category: "Grammar",
      order_index: 28,
      examples: [
        { sentence: "I need to have my passport renewed.", translation: "Tôi cần gia hạn hộ chiếu.", explanation: "Causative 'have something done' for arranging a service" },
        { sentence: "She had her wedding dress designed by a famous artist.", translation: "Cô ấy đã nhờ một nghệ sĩ nổi tiếng thiết kế váy cưới.", explanation: "Past causative: arranged for someone to design the dress" },
        { sentence: "The manager had his assistant prepare the report.", translation: "Quản lý đã bảo trợ lý chuẩn bị báo cáo.", explanation: "Active causative 'have + person + V': ask someone to do" },
      ]
    },
    {
      title: "Mệnh đề phân từ (Participle Clauses)",
      content: `Participle clauses use present (-ing) or past (-ed/-en) participles to shorten clauses.

Present Participle (-ing) — active meaning:
• Walking home, I met an old friend. (= While I was walking home...)
• Not knowing what to do, she called for help. (= Because she didn't know...)
• The man sitting over there is my boss. (= who is sitting...)

Past Participle (V3) — passive meaning:
• Given more time, we could have done better. (= If we were given...)
• The book published last year became a bestseller. (= which was published...)
• Exhausted after the long journey, he went straight to bed. (= Because he was exhausted...)

Perfect Participle (Having + V3) — for earlier actions:
• Having finished his work, he went home. (= After he had finished...)
• Having been rejected twice, she felt discouraged. (= Because she had been rejected...)

Common uses:
• Formal writing (essays, reports, literature)
• Reducing sentence length
• Connecting related ideas smoothly

Dấu hiệu nhận biết: mệnh đề phân từ thường đứng đầu câu hoặc sau danh từ, rút gọn từ mệnh đề trạng ngữ hoặc mệnh đề quan hệ. Chủ ngữ của mệnh đề phân từ phải đồng nhất với chủ ngữ chính.`,
      level: "advanced",
      category: "Grammar",
      order_index: 29,
      examples: [
        { sentence: "Having finished all her homework, she went out to play.", translation: "Sau khi làm xong hết bài tập, cô ấy ra ngoài chơi.", explanation: "Perfect participle for action completed before the main action" },
        { sentence: "Built in the 18th century, the cathedral attracts many tourists.", translation: "Được xây dựng vào thế kỷ 18, nhà thờ thu hút nhiều khách du lịch.", explanation: "Past participle clause with passive meaning" },
        { sentence: "Walking along the beach, she found a beautiful shell.", translation: "Đi dọc bãi biển, cô ấy tìm thấy một vỏ sò đẹp.", explanation: "Present participle for simultaneous action" },
      ]
    },
    {
      title: "Câu ước & Sự hối tiếc (Wishes & Regrets)",
      content: `Express wishes about the present, past, and future with different structures.

Wish about the present (something is not true now):
• Subject + wish + Subject + Past Simple
• I wish I knew the answer. (I don't know it)
• I wish I were taller. (I'm not tall — note: 'were' not 'was')
• She wishes she didn't have to work. (she has to work)

Wish about the past (regret about something that happened):
• Subject + wish + Subject + Past Perfect (had + V3)
• I wish I had studied harder. (I didn't study hard)
• She wishes she hadn't said that. (she said it)
• We wish we had arrived earlier. (we arrived late)

Wish about the future (want something to change):
• Subject + wish + Subject + would + V
• I wish you would stop smoking.
• I wish it would stop raining.
• She wishes he would call more often.

If only (stronger emphasis):
• If only I knew the truth! (= I really wish I knew)
• If only I had listened to your advice! (= I regret I didn't)
• If only he would apologize! (= I want him to apologize)

Should have / Could have / Might have (expressing regret):
• I should have studied harder. (but I didn't)
• You could have told me earlier. (but you didn't)
• She might have asked for help. (but she didn't)

Dấu hiệu nhận biết:
• Wish + thì quá khứ: ước ở hiện tại (Past Simple), ước ở quá khứ (Past Perfect), ước ở tương lai (would + V)
• If only: nhấn mạnh hơn wish, cùng cấu trúc
• Should have + V3: đáng lẽ nên làm (nhưng đã không làm)
• Could have + V3: đáng lẽ có thể (nhưng đã không)
• Might have + V3: có lẽ đã (nhưng không chắc)
• Would rather + thì quá khứ: muốn ai đó làm gì ở hiện tại/quá khứ`,
      level: "advanced",
      category: "Mood",
      order_index: 30,
      examples: [
        { sentence: "I wish I had paid more attention in class.", translation: "Tôi ước mình đã chú ý hơn trong lớp.", explanation: "Wish about the past: Past Perfect for regret" },
        { sentence: "If only I could speak English fluently!", translation: "Giá mà tôi có thể nói tiếng Anh trôi chảy!", explanation: "'If only' for strong wish about present inability" },
        { sentence: "I should have taken that job offer.", translation: "Đáng lẽ tôi nên nhận lời mời làm việc đó.", explanation: "'Should have' expresses regret about a past decision" },
      ]
    },
    {
      title: "Lượng từ & Định từ (Quantifiers & Determiners)",
      content: `Quantifiers and determiners tell us how many or how much.

ALL / EVERY / EACH:
• All students must attend. (100%, group focus)
• Every student must attend. (100%, individual focus)
• Each student received a certificate. (one by one)

BOTH / NEITHER / EITHER:
• Both answers are correct. (two out of two)
• Neither answer is correct. (zero out of two)
• Either answer is fine. (one out of two)

SOME / ANY / NO:
• Some + positive: I have some friends.
• Any + negative/question: I don't have any money.
• No + positive verb: There is no time. (= There isn't any time)

MUCH / MANY / A LOT OF:
• Much + uncountable: How much time? (in negatives/questions)
• Many + countable: Many people agree. (in positives)
• A lot of + both: A lot of work / A lot of people

FEW / LITTLE:
• Few + countable: Few people came. (not many)
• A few + countable: A few people came. (some)
• Little + uncountable: Little time remains. (not much)
• A little + uncountable: A little sugar, please. (some)

EITHER / NEITHER of + plural noun + singular verb:
• Either of the options is acceptable.
• Neither of the students was late.

Dấu hiệu nhận biết:
• ALL + danh từ số nhiều/không đếm được: tất cả
• EVERY + danh từ số ít: mọi (từng cái một)
• EACH + danh từ số ít: mỗi (nhấn mạnh cá thể)
• BOTH + danh từ số nhiều: cả hai
• NEITHER + danh từ số ít: không cái nào trong hai
• EITHER + danh từ số ít: một trong hai
• SOME + danh từ đếm được số nhiều/không đếm được: một vài (câu khẳng định)
• ANY + danh từ: bất kỳ (câu phủ định/nghi vấn)
• NO + danh từ: không có
• MANY + danh từ đếm được số nhiều: nhiều
• MUCH + danh từ không đếm được: nhiều (thường dùng trong phủ định/nghi vấn)
• A FEW + danh từ đếm được: một vài (đủ dùng)
• FEW + danh từ đếm được: rất ít (không đủ)
• A LITTLE + danh từ không đếm được: một chút (đủ dùng)
• LITTLE + danh từ không đếm được: rất ít (không đủ)`,
      level: "advanced",
      category: "Grammar",
      order_index: 31,
      examples: [
        { sentence: "Neither of the candidates was suitable for the position.", translation: "Không ứng viên nào phù hợp với vị trí đó.", explanation: "'Neither of' + plural noun + singular verb" },
        { sentence: "Few people understand the complexity of the issue.", translation: "Ít người hiểu được sự phức tạp của vấn đề.", explanation: "'Few' emphasizes a small number (negative sense)" },
        { sentence: "I have a little experience in programming.", translation: "Tôi có một chút kinh nghiệm về lập trình.", explanation: "'A little' + uncountable noun = some (positive sense)" },
      ]
    },
  ];

  for (const lesson of grammarLessons) {
    db.run(
      "INSERT INTO grammar_lessons (title, content, level, category, order_index) VALUES (?, ?, ?, ?, ?)",
      [lesson.title, lesson.content, lesson.level, lesson.category, lesson.order_index]
    );
    const lessonIdResult = db.exec("SELECT last_insert_rowid()");
    const lessonId = lessonIdResult[0].values[0][0] as number;
    for (const ex of lesson.examples) {
      db.run(
        "INSERT INTO grammar_examples (lesson_id, sentence, translation, explanation) VALUES (?, ?, ?, ?)",
        [lessonId, ex.sentence, ex.translation, ex.explanation]
      );
    }
  }

  // === EXERCISES ===
  const exercises = [
    // ========== LESSON 1: PRESENT SIMPLE ==========
    { lesson_type: "grammar", lesson_id: 1, question: "She ___ to school every day.", options: ["go", "goes", "going", "went"], correct_answer: "goes", explanation: "Third person singular needs 'goes'", difficulty: "beginner" },
    { lesson_type: "grammar", lesson_id: 1, question: "They ___ like coffee.", options: ["doesn't", "don't", "isn't", "aren't"], correct_answer: "don't", explanation: "Negative for I/You/We/They needs 'don't'", difficulty: "beginner" },
    { lesson_type: "grammar", lesson_id: 1, question: "___ you speak English?", options: ["Does", "Do", "Are", "Is"], correct_answer: "Do", explanation: "Question for 'you' needs 'Do'", difficulty: "beginner" },
    { lesson_type: "grammar", lesson_id: 1, question: "He ___ (watch) TV every evening.", options: ["watch", "watches", "watching", "watched"], correct_answer: "watches", explanation: "Third person singular: watch → watches", difficulty: "beginner" },
    { lesson_type: "grammar", lesson_id: 1, question: "My mother ___ (cook) dinner every night.", options: ["cook", "cooks", "cooking", "cooked"], correct_answer: "cooks", explanation: "Third person singular: cook → cooks", difficulty: "beginner" },
    { lesson_type: "grammar", lesson_id: 1, question: "The Earth ___ (go) around the Sun.", options: ["go", "goes", "going", "went"], correct_answer: "goes", explanation: "A general truth/fact uses Present Simple", difficulty: "beginner" },
    { lesson_type: "grammar", lesson_id: 1, question: "___ the train arrive at 6 PM?", options: ["Do", "Does", "Is", "Are"], correct_answer: "Does", explanation: "Question formation for third person singular", difficulty: "beginner" },

    // ========== LESSON 2: PRESENT CONTINUOUS ==========
    { lesson_type: "grammar", lesson_id: 2, question: "I ___ (read) a book right now.", options: ["read", "am reading", "reads", "was reading"], correct_answer: "am reading", explanation: "Present Continuous for action happening now", difficulty: "beginner" },
    { lesson_type: "grammar", lesson_id: 2, question: "They ___ (build) a new hospital this year.", options: ["build", "are building", "built", "builds"], correct_answer: "are building", explanation: "Present Continuous for temporary situation", difficulty: "beginner" },
    { lesson_type: "grammar", lesson_id: 2, question: "She ___ (not/sleep) at the moment.", options: ["isn't sleeping", "doesn't sleep", "not sleeps", "is sleeping"], correct_answer: "isn't sleeping", explanation: "Negative Present Continuous", difficulty: "beginner" },
    { lesson_type: "grammar", lesson_id: 2, question: "Listen! The birds ___ (sing).", options: ["sing", "are singing", "sings", "sang"], correct_answer: "are singing", explanation: "Action happening at the moment of speaking", difficulty: "beginner" },
    { lesson_type: "grammar", lesson_id: 2, question: "We ___ (meet) our friends tomorrow evening.", options: ["meet", "are meeting", "meets", "met"], correct_answer: "are meeting", explanation: "Present Continuous for fixed future arrangements", difficulty: "beginner" },
    { lesson_type: "grammar", lesson_id: 2, question: "Please be quiet. I ___ (try) to focus.", options: ["try", "am trying", "tries", "tried"], correct_answer: "am trying", explanation: "Action in progress at the moment of speaking", difficulty: "beginner" },

    // ========== LESSON 3: PAST SIMPLE VS PRESENT PERFECT ==========
    { lesson_type: "grammar", lesson_id: 3, question: "I ___ (visit) Paris last year.", options: ["have visited", "visited", "was visiting", "had visited"], correct_answer: "visited", explanation: "'Last year' is a specific past time → Past Simple", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 3, question: "She ___ (never/be) to Japan.", options: ["never went", "has never been", "was never", "never goes"], correct_answer: "has never been", explanation: "Experience with 'never' → Present Perfect", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 3, question: "I ___ (already/finish) my homework.", options: ["already finished", "have already finished", "already finish", "was already finishing"], correct_answer: "have already finished", explanation: "'Already' with present relevance → Present Perfect", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 3, question: "They ___ (live) in London since 2020.", options: ["lived", "have lived", "live", "were living"], correct_answer: "have lived", explanation: "'Since' marks the starting point → Present Perfect", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 3, question: "He ___ (work) for that company for 10 years before he retired.", options: ["has worked", "worked", "was working", "had worked"], correct_answer: "worked", explanation: "Completed action in the past with 'before' → Past Simple", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 3, question: "___ you ever ___ (eat) Vietnamese food?", options: ["Did...eat", "Have...eaten", "Do...eat", "Were...eating"], correct_answer: "Have...eaten", explanation: "'Ever' asks about experience → Present Perfect", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 3, question: "She ___ (just/leave) for the airport.", options: ["just left", "has just left", "was just leaving", "had just left"], correct_answer: "has just left", explanation: "'Just' with recent past action → Present Perfect", difficulty: "intermediate" },

    // ========== LESSON 4: CONDITIONAL SENTENCES ==========
    { lesson_type: "grammar", lesson_id: 4, question: "If I ___ (be) you, I would accept the offer.", options: ["am", "was", "were", "be"], correct_answer: "were", explanation: "Second conditional uses 'were' for all persons", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 4, question: "If it rains, I ___ (stay) home.", options: ["stay", "will stay", "would stay", "stayed"], correct_answer: "will stay", explanation: "First conditional: if + present, will + verb", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 4, question: "If I ___ (study) harder, I would have passed the exam.", options: ["studied", "had studied", "have studied", "would study"], correct_answer: "had studied", explanation: "Third conditional: if + past perfect, would have + V3", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 4, question: "If you heat ice, it ___ (melt).", options: ["melts", "will melt", "would melt", "melted"], correct_answer: "melts", explanation: "Zero conditional: if + present, present (general truth)", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 4, question: "She would travel the world if she ___ (have) more money.", options: ["has", "had", "would have", "having"], correct_answer: "had", explanation: "Second conditional: if + past simple, would + V", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 4, question: "If we ___ (leave) earlier, we wouldn't have missed the flight.", options: ["left", "had left", "leave", "were leaving"], correct_answer: "had left", explanation: "Third conditional: if + had + V3, would have + V3", difficulty: "intermediate" },

    // ========== LESSON 5: PASSIVE VOICE ==========
    { lesson_type: "grammar", lesson_id: 5, question: "The report ___ (write) by the manager yesterday.", options: ["wrote", "was written", "is written", "has written"], correct_answer: "was written", explanation: "Past Simple Passive: was/were + V3", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 5, question: "English ___ (speak) all over the world.", options: ["speaks", "is spoken", "spoke", "was spoken"], correct_answer: "is spoken", explanation: "Present Simple Passive: is/am/are + V3", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 5, question: "The meeting ___ (postpone) due to bad weather.", options: ["postponed", "was postponed", "has been postponed", "is postponing"], correct_answer: "has been postponed", explanation: "Present Perfect Passive: has/have been + V3", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 5, question: "Dinner ___ (serve) at 7 PM every evening.", options: ["serves", "is served", "served", "was served"], correct_answer: "is served", explanation: "Present Simple Passive for regular action", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 5, question: "The letter ___ (send) tomorrow.", options: ["sends", "will be sent", "is sending", "sent"], correct_answer: "will be sent", explanation: "Future Passive: will be + V3", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 5, question: "This room ___ (clean) every day.", options: ["cleans", "is cleaned", "is cleaning", "cleaned"], correct_answer: "is cleaned", explanation: "Present Simple Passive: is + V3", difficulty: "intermediate" },

    // ========== LESSON 6: REPORTED SPEECH ==========
    { lesson_type: "grammar", lesson_id: 6, question: 'She said, "I am tired." → She said that she ___ tired.', options: ["am", "is", "was", "were"], correct_answer: "was", explanation: "Present → Past tense backshift in reported speech", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 6, question: '"I will call you tomorrow" → He said he would call me ___.', options: ["tomorrow", "the next day", "today", "yesterday"], correct_answer: "the next day", explanation: "'Tomorrow' changes to 'the next day' in reported speech", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 6, question: '"I have finished the report," she said. → She said she ___ the report.', options: ["finished", "had finished", "has finished", "was finishing"], correct_answer: "had finished", explanation: "Present Perfect → Past Perfect in reported speech", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 6, question: '"Can you help me?" he asked. → He asked ___ I could help him.', options: ["that", "if", "what", "who"], correct_answer: "if", explanation: "'If' is used to report yes/no questions", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 6, question: `"Don't touch the wire," the electrician warned. → The electrician warned ___ touch the wire.`, options: ["don't", "not to", "didn't", "doesn't"], correct_answer: "not to", explanation: "Negative commands → 'not to' + verb in reported speech", difficulty: "advanced" },

    // ========== LESSON 7: SUBJUNCTIVE MOOD ==========
    { lesson_type: "grammar", lesson_id: 7, question: "I wish I ___ taller.", options: ["am", "was", "were", "be"], correct_answer: "were", explanation: "Subjunctive uses 'were' for all persons after 'wish'", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 7, question: "The doctor recommended that she ___ more water.", options: ["drinks", "drank", "drink", "is drinking"], correct_answer: "drink", explanation: "Subjunctive uses base form after 'recommend'", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 7, question: "It is vital that every student ___ the exam.", options: ["passes", "pass", "passed", "will pass"], correct_answer: "pass", explanation: "Subjunctive uses base form after 'vital that'", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 7, question: "I suggest that he ___ (see) a doctor immediately.", options: ["sees", "see", "saw", "seeing"], correct_answer: "see", explanation: "Subjunctive base form after 'suggest'", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 7, question: "It is essential that the report ___ (be) ready by noon.", options: ["is", "was", "be", "being"], correct_answer: "be", explanation: "Subjunctive uses base form 'be' after 'essential that'", difficulty: "advanced" },

    // ========== LESSON 8: FUTURE TENSES ==========
    { lesson_type: "grammar", lesson_id: 8, question: "I promise I ___ (call) you tomorrow.", options: ["call", "will call", "am calling", "called"], correct_answer: "will call", explanation: "'Will' for spontaneous promises", difficulty: "beginner" },
    { lesson_type: "grammar", lesson_id: 8, question: "She ___ (study) medicine at university next year.", options: ["will study", "is going to study", "studies", "studied"], correct_answer: "is going to study", explanation: "'Going to' for planned intention", difficulty: "beginner" },
    { lesson_type: "grammar", lesson_id: 8, question: "The train ___ (leave) at 7 AM tomorrow.", options: ["will leave", "is leaving", "leaves", "left"], correct_answer: "leaves", explanation: "Present Simple for scheduled events", difficulty: "beginner" },
    { lesson_type: "grammar", lesson_id: 8, question: "By this time next year, I ___ (graduate).", options: ["graduate", "will have graduated", "am graduating", "graduated"], correct_answer: "will have graduated", explanation: "Future Perfect for completed action by a future time", difficulty: "beginner" },
    { lesson_type: "grammar", lesson_id: 8, question: "This time tomorrow, we ___ (fly) to Tokyo.", options: ["fly", "will fly", "will be flying", "are flying"], correct_answer: "will be flying", explanation: "Future Continuous for action in progress at a future moment", difficulty: "beginner" },
    { lesson_type: "grammar", lesson_id: 8, question: "Look at those clouds! It ___ (rain).", options: ["rains", "will rain", "is going to rain", "rained"], correct_answer: "is going to rain", explanation: "'Going to' for prediction based on present evidence", difficulty: "beginner" },

    // ========== LESSON 9: PAST CONTINUOUS & PAST PERFECT ==========
    { lesson_type: "grammar", lesson_id: 9, question: "I ___ (watch) TV when she arrived.", options: ["watched", "was watching", "have watched", "had watched"], correct_answer: "was watching", explanation: "Past Continuous for interrupted action", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 9, question: "While I ___ (cook), he was cleaning.", options: ["cooked", "was cooking", "had cooked", "have cooked"], correct_answer: "was cooking", explanation: "Past Continuous for parallel actions", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 9, question: "They ___ (wait) for an hour before the bus arrived.", options: ["waited", "were waiting", "had been waiting", "have been waiting"], correct_answer: "had been waiting", explanation: "Past Perfect Continuous for duration before past event", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 9, question: "When I arrived at the party, everyone ___ (already/leave).", options: ["already left", "had already left", "have already left", "was already leaving"], correct_answer: "had already left", explanation: "Past Perfect for action completed before another past event", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 9, question: "She ___ (study) for three hours when her friends called.", options: ["studied", "had been studying", "was studying", "has been studying"], correct_answer: "had been studying", explanation: "Past Perfect Continuous emphasizes duration before past event", difficulty: "intermediate" },

    // ========== LESSON 10: ARTICLES ==========
    { lesson_type: "grammar", lesson_id: 10, question: "I saw ___ elephant at the zoo.", options: ["a", "an", "the", "no article"], correct_answer: "an", explanation: "'An' before vowel sound in 'elephant'", difficulty: "beginner" },
    { lesson_type: "grammar", lesson_id: 10, question: "She is ___ teacher at my school.", options: ["a", "an", "the", "no article"], correct_answer: "a", explanation: "'A' before consonant sound, for a profession", difficulty: "beginner" },
    { lesson_type: "grammar", lesson_id: 10, question: "___ sun rises in the east.", options: ["A", "An", "The", "No article"], correct_answer: "The", explanation: "'The' for unique things like the sun", difficulty: "beginner" },
    { lesson_type: "grammar", lesson_id: 10, question: "I like ___ music.", options: ["a", "an", "the", "no article"], correct_answer: "no article", explanation: "Zero article for general uncountable nouns", difficulty: "beginner" },
    { lesson_type: "grammar", lesson_id: 10, question: "She plays ___ piano beautifully.", options: ["a", "an", "the", "no article"], correct_answer: "the", explanation: "'The' with musical instruments", difficulty: "beginner" },

    // ========== LESSON 11: PREPOSITIONS ==========
    { lesson_type: "grammar", lesson_id: 11, question: "I wake up ___ 6 AM every day.", options: ["in", "on", "at", "by"], correct_answer: "at", explanation: "'At' for specific time", difficulty: "beginner" },
    { lesson_type: "grammar", lesson_id: 11, question: "My birthday is ___ June 15th.", options: ["in", "on", "at", "by"], correct_answer: "on", explanation: "'On' for specific dates", difficulty: "beginner" },
    { lesson_type: "grammar", lesson_id: 11, question: "She is waiting ___ the bus stop.", options: ["in", "on", "at", "to"], correct_answer: "at", explanation: "'At' for specific location points", difficulty: "beginner" },
    { lesson_type: "grammar", lesson_id: 11, question: "The cat is ___ the table.", options: ["in", "on", "at", "under"], correct_answer: "on", explanation: "'On' for surfaces", difficulty: "beginner" },
    { lesson_type: "grammar", lesson_id: 11, question: "I usually go to work ___ bus.", options: ["in", "on", "by", "at"], correct_answer: "by", explanation: "'By' for method of transport", difficulty: "beginner" },

    // ========== LESSON 12: RELATIVE CLAUSES ==========
    { lesson_type: "grammar", lesson_id: 12, question: "The woman ___ lives next door is a doctor.", options: ["which", "who", "whom", "where"], correct_answer: "who", explanation: "'Who' for people in defining relative clauses", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 12, question: "The book ___ I read was fantastic.", options: ["who", "whom", "which", "where"], correct_answer: "which", explanation: "'Which' for things in defining relative clauses", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 12, question: "That's the house ___ I grew up.", options: ["which", "that", "where", "who"], correct_answer: "where", explanation: "'Where' for places in relative clauses", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 12, question: "The man ___ car was stolen called the police.", options: ["who", "which", "whose", "whom"], correct_answer: "whose", explanation: "'Whose' for possession in relative clauses", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 12, question: "My sister, ___ lives in London, is a lawyer.", options: ["which", "that", "who", "whom"], correct_answer: "who", explanation: "Non-defining relative clause with 'who'", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 12, question: "The Eiffel Tower, ___ is in Paris, is beautiful.", options: ["that", "which", "where", "who"], correct_answer: "which", explanation: "Non-defining relative clause with 'which'", difficulty: "intermediate" },

    // ========== LESSON 13: COMPARATIVES & SUPERLATIVES ==========
    { lesson_type: "grammar", lesson_id: 13, question: "This car is ___ (fast) than that one.", options: ["fast", "faster", "fastest", "more fast"], correct_answer: "faster", explanation: "Comparative: short adjective + -er + than", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 13, question: "She is ___ (intelligent) student in the class.", options: ["more intelligent than", "the most intelligent", "intelligent", "most intelligent"], correct_answer: "the most intelligent", explanation: "Superlative: the most + long adjective", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 13, question: "He is ___ (tall) as his brother.", options: ["taller", "as tall", "the tallest", "more tall"], correct_answer: "as tall", explanation: "Equal comparison: as + adjective + as", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 13, question: "This is ___ (good) pizza I have ever eaten.", options: ["the better", "the best", "best", "good"], correct_answer: "the best", explanation: "Irregular superlative 'the best'", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 13, question: "My house is ___ (small) than yours.", options: ["small", "smaller", "smallest", "more small"], correct_answer: "smaller", explanation: "Comparative: small + -er = smaller", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 13, question: "This book is ___ (expensive) than that one.", options: ["expensive", "more expensive", "most expensive", "expensiver"], correct_answer: "more expensive", explanation: "Long adjective: more + adjective + than", difficulty: "intermediate" },

    // ========== LESSON 14: MODAL VERBS ==========
    { lesson_type: "grammar", lesson_id: 14, question: "You ___ wear a helmet when riding a motorcycle.", options: ["can", "must", "should", "might"], correct_answer: "must", explanation: "'Must' for strong obligation/rule", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 14, question: "She ___ speak three languages.", options: ["must", "can", "should", "might"], correct_answer: "can", explanation: "'Can' for ability", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 14, question: "You ___ see a doctor. You look sick.", options: ["can", "must", "should", "might"], correct_answer: "should", explanation: "'Should' for advice", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 14, question: "___ I borrow your pen, please?", options: ["Must", "Can", "Should", "Need"], correct_answer: "Can", explanation: "'Can' for polite requests", difficulty: "intermediate" },
    { lesson_type: "grammar", lesson_id: 14, question: "You ___ not smoke in this building.", options: ["can", "must", "should", "might"], correct_answer: "must", explanation: "'Must not' for prohibition", difficulty: "intermediate" },

    // ========== LESSON 15: GERUNDS & INFINITIVES ==========
    { lesson_type: "grammar", lesson_id: 15, question: "I enjoy ___ (listen) to music.", options: ["listen", "listening", "to listen", "listened"], correct_answer: "listening", explanation: "'Enjoy' is followed by a gerund (V-ing)", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 15, question: "She decided ___ (study) abroad.", options: ["study", "studying", "to study", "studied"], correct_answer: "to study", explanation: "'Decide' is followed by an infinitive (to + V)", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 15, question: "I stopped ___ (smoke) last year.", options: ["smoke", "smoking", "to smoke", "smoked"], correct_answer: "smoking", explanation: "'Stop + gerund' means quit an action", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 15, question: "Remember ___ (lock) the door when you leave.", options: ["lock", "locking", "to lock", "locked"], correct_answer: "to lock", explanation: "'Remember + infinitive' means don't forget to do something", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 15, question: "___ (swim) is a great form of exercise.", options: ["Swim", "Swimming", "To swim", "Swam"], correct_answer: "Swimming", explanation: "Gerund as subject of sentence", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 15, question: "Thank you for ___ (help) me.", options: ["help", "helping", "to help", "helped"], correct_answer: "helping", explanation: "Gerund after preposition 'for'", difficulty: "advanced" },

    // ========== LESSON 16: PHRASAL VERBS ==========
    { lesson_type: "grammar", lesson_id: 16, question: "Please ___ the lights when you leave.", options: ["turn off", "turn on", "look up", "give up"], correct_answer: "turn off", explanation: "'Turn off' means to stop a device/lights", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 16, question: "I ___ an old friend at the mall yesterday.", options: ["gave up", "ran into", "looked after", "put off"], correct_answer: "ran into", explanation: "'Run into' means to meet someone unexpectedly", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 16, question: "She ___ sugar for health reasons.", options: ["took off", "ran into", "gave up", "looked up"], correct_answer: "gave up", explanation: "'Give up' means to quit something", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 16, question: "I need to ___ the meaning of this word.", options: ["look up", "look after", "look into", "look for"], correct_answer: "look up", explanation: "'Look up' means to search for information", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 16, question: "He promised to ___ smoking.", options: ["give up", "give in", "give out", "give away"], correct_answer: "give up", explanation: "'Give up' means to quit a habit", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 16, question: "The meeting was ___ until next week.", options: ["put off", "put on", "put out", "put up"], correct_answer: "put off", explanation: "'Put off' means to postpone", difficulty: "advanced" },

    // ========== LESSON 17: LINKING WORDS ==========
    { lesson_type: "grammar", lesson_id: 17, question: "___ it rained, we enjoyed the trip.", options: ["Because", "Although", "Therefore", "Moreover"], correct_answer: "Although", explanation: "'Although' is used to express contrast", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 17, question: "She studied hard; ___, she got excellent grades.", options: ["however", "therefore", "although", "but"], correct_answer: "therefore", explanation: "'Therefore' indicates cause and effect (result)", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 17, question: "He is rich ___ his brother is poor.", options: ["because", "whereas", "so", "thus"], correct_answer: "whereas", explanation: "'Whereas' for direct contrast", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 17, question: "___ the rain, we went for a walk.", options: ["Although", "Despite", "Because", "Therefore"], correct_answer: "Despite", explanation: "'Despite' + noun phrase for concession", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 17, question: "You can go out ___ you finish your homework.", options: ["provided that", "despite", "whereas", "nevertheless"], correct_answer: "provided that", explanation: "'Provided that' introduces a condition", difficulty: "advanced" },

    // ========== LESSON 18: INVERSION & EMPHASIS ==========
    { lesson_type: "grammar", lesson_id: 18, question: "___ have I felt so embarrassed.", options: ["Never", "Always", "Often", "Sometimes"], correct_answer: "Never", explanation: "Negative adverbial at start triggers inversion", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 18, question: "Only after the test ___ I realize my mistake.", options: ["did", "was", "had", "do"], correct_answer: "did", explanation: "'Only after' at start → inverted verb", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 18, question: "Not only ___ she speak English, but she also writes poetry.", options: ["does", "do", "did", "is"], correct_answer: "does", explanation: "Inversion with 'not only' at the beginning", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 18, question: "Rarely ___ such a beautiful sunset.", options: ["I have seen", "have I seen", "I saw", "did I see"], correct_answer: "have I seen", explanation: "'Rarely' at start triggers inversion", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 18, question: "Under no circumstances ___ you lie.", options: ["you should", "should you", "you must", "must you"], correct_answer: "should you", explanation: "'Under no circumstances' triggers inversion", difficulty: "advanced" },

    // ========== LESSON 19: CLEFT SENTENCES ==========
    { lesson_type: "grammar", lesson_id: 19, question: "___ was Maria who won the first prize.", options: ["It", "That", "This", "There"], correct_answer: "It", explanation: "IT-cleft: 'It + be + emphasized part + who/that'", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 19, question: "What I really need ___ a long holiday.", options: ["are", "is", "was", "were"], correct_answer: "is", explanation: "WH-cleft: 'What + subject + need + is...'", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 19, question: "It was yesterday ___ she resigned.", options: ["when", "that", "which", "who"], correct_answer: "that", explanation: "IT-cleft emphasizing time uses 'that'", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 19, question: "___ she did was quit her job.", options: ["That", "What", "Which", "It"], correct_answer: "What", explanation: "WH-cleft: 'What + subject + did + be + ...'", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 19, question: "It was because of the traffic ___ we were late.", options: ["why", "that", "when", "which"], correct_answer: "that", explanation: "IT-cleft emphasizing the reason uses 'that'", difficulty: "advanced" },

    // ========== LESSON 20: MIXED CONDITIONALS ==========
    { lesson_type: "grammar", lesson_id: 20, question: "If I had studied medicine, I ___ a doctor now.", options: ["would be", "would have been", "am", "was"], correct_answer: "would be", explanation: "Mixed: past condition → present result (would + V)", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 20, question: "If she ___ so shy, she would have spoken up.", options: ["weren't", "wasn't", "isn't", "hadn't been"], correct_answer: "weren't", explanation: "Mixed: present trait → past result (if + past simple, would have + V3)", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 20, question: "If I ___ rich, I would have bought that house.", options: ["am", "were", "had been", "would be"], correct_answer: "were", explanation: "Mixed: present state → past action", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 20, question: "If he had saved money, he ___ in debt now.", options: ["wouldn't be", "wouldn't have been", "isn't", "won't be"], correct_answer: "wouldn't be", explanation: "Mixed: past action → present situation", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 20, question: "If I ___ that job, I would be living in London now.", options: ["took", "had taken", "would take", "have taken"], correct_answer: "had taken", explanation: "Mixed: past condition (had + V3) → present result (would + V)", difficulty: "advanced" },

    // ========== LESSON 21: CAUSATIVE FORM ==========
    { lesson_type: "grammar", lesson_id: 21, question: "I need to have my passport ___ (renew).", options: ["renew", "renewing", "renewed", "to renew"], correct_answer: "renewed", explanation: "Causative 'have something done' → have + object + V3", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 21, question: "She ___ her nails done yesterday.", options: ["had", "has", "got", "gets"], correct_answer: "got", explanation: "'Get something done' for arranging services (informal)", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 21, question: "The teacher made us ___ (rewrite) the essay.", options: ["rewrite", "rewriting", "rewrote", "to rewrite"], correct_answer: "rewrite", explanation: "Active causative 'make + person + V' (without 'to')", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 21, question: "I ___ the technician check my computer.", options: ["made", "had", "got", "let"], correct_answer: "had", explanation: "Active causative 'have + person + V'", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 21, question: "We are going to ___ our house painted next month.", options: ["make", "have", "get", "let"], correct_answer: "have", explanation: "'Have something done' for arranging a service", difficulty: "advanced" },

    // ========== LESSON 22: PARTICIPLE CLAUSES ==========
    { lesson_type: "grammar", lesson_id: 22, question: "___ (walk) home, I met an old friend.", options: ["Walked", "Walking", "To walk", "Having walked"], correct_answer: "Walking", explanation: "Present participle for simultaneous action", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 22, question: "___ (give) more time, we could have done better.", options: ["Giving", "Given", "To give", "Having given"], correct_answer: "Given", explanation: "Past participle clause with passive meaning", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 22, question: "___ (finish) his work, he went home.", options: ["Finished", "Finishing", "Having finished", "To finish"], correct_answer: "Having finished", explanation: "Perfect participle for action before the main verb", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 22, question: "___ (build) in the 18th century, the cathedral is a tourist attraction.", options: ["Building", "Built", "Having built", "To build"], correct_answer: "Built", explanation: "Past participle for passive meaning", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 22, question: "___ (not/know) what to do, she called for help.", options: ["Not known", "Not knowing", "Having not known", "To not know"], correct_answer: "Not knowing", explanation: "Negative participle clause with 'not + V-ing'", difficulty: "advanced" },

    // ========== LESSON 23: WISHES & REGRETS ==========
    { lesson_type: "grammar", lesson_id: 23, question: "I wish I ___ (pay) more attention in class.", options: ["paid", "had paid", "would pay", "pay"], correct_answer: "had paid", explanation: "Wish about the past uses Past Perfect (had + V3)", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 23, question: "I wish I ___ (know) the answer right now.", options: ["know", "knew", "had known", "would know"], correct_answer: "knew", explanation: "Wish about the present uses Past Simple", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 23, question: "If only I ___ speak English fluently!", options: ["can", "could", "would", "will"], correct_answer: "could", explanation: "'If only' for strong wish about present ability", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 23, question: "I ___ have studied harder for the exam.", options: ["must", "should", "could", "would"], correct_answer: "should", explanation: "'Should have' expresses regret about a past action", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 23, question: "I wish you ___ (stop) smoking. It's bad for your health.", options: ["stop", "stopped", "would stop", "had stopped"], correct_answer: "would stop", explanation: "Wish about the future: wish + would + V", difficulty: "advanced" },

    // ========== LESSON 24: QUANTIFIERS & DETERMINERS ==========
    { lesson_type: "grammar", lesson_id: 24, question: "___ of the candidates was suitable for the position.", options: ["Neither", "None", "Both", "All"], correct_answer: "Neither", explanation: "'Neither of' + plural noun + singular verb = zero out of two", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 24, question: "___ people understand the complexity of this issue.", options: ["A little", "Few", "Much", "Little"], correct_answer: "Few", explanation: "'Few' + countable noun = not many (negative sense)", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 24, question: "I have ___ experience in programming.", options: ["a little", "a few", "few", "many"], correct_answer: "a little", explanation: "'A little' + uncountable noun = some (positive sense)", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 24, question: "___ student must submit their assignment by Friday.", options: ["All", "Every", "Both", "Some"], correct_answer: "Every", explanation: "'Every' + singular noun for 100% individual focus", difficulty: "advanced" },
    { lesson_type: "grammar", lesson_id: 24, question: "There are ___ people who disagree with the decision.", options: ["much", "many", "a little", "little"], correct_answer: "many", explanation: "'Many' + countable noun in positive sentences", difficulty: "advanced" },

    // ========== VOCABULARY - BEGINNER ==========
    { lesson_type: "vocabulary", lesson_id: null, question: "'Hello' in Vietnamese is ___?", options: ["Tạm biệt", "Xin chào", "Cảm ơn", "Làm ơn"], correct_answer: "Xin chào", explanation: "'Hello' translates to 'Xin chào'", difficulty: "beginner" },
    { lesson_type: "vocabulary", lesson_id: null, question: "What is the English word for 'mẹ'?", options: ["Mother", "Father", "Sister", "Brother"], correct_answer: "Mother", explanation: "'Mother' means 'mẹ' in Vietnamese", difficulty: "beginner" },
    { lesson_type: "vocabulary", lesson_id: null, question: "'Rice' in Vietnamese is ___?", options: ["Bánh mì", "Cơm", "Phở", "Cháo"], correct_answer: "Cơm", explanation: "'Rice' means 'cơm' or 'gạo'", difficulty: "beginner" },
    { lesson_type: "vocabulary", lesson_id: null, question: "What does 'delicious' mean?", options: ["Dở", "Ngon", "Mặn", "Ngọt"], correct_answer: "Ngon", explanation: "'Delicious' means 'ngon'", difficulty: "beginner" },
    { lesson_type: "vocabulary", lesson_id: null, question: "Which word means 'thức dậy'?", options: ["Go to bed", "Wake up", "Get dressed", "Cook"], correct_answer: "Wake up", explanation: "'Wake up' means 'thức dậy'", difficulty: "beginner" },
    { lesson_type: "vocabulary", lesson_id: null, question: "How do you say 'bạn khỏe không' in English?", options: ["How are you?", "What's your name?", "Where are you from?", "How old are you?"], correct_answer: "How are you?", explanation: "'How are you?' means 'bạn khỏe không'", difficulty: "beginner" },
    { lesson_type: "vocabulary", lesson_id: null, question: "'Water' in Vietnamese is ___?", options: ["Sữa", "Nước", "Cà phê", "Trà"], correct_answer: "Nước", explanation: "'Water' means 'nước'", difficulty: "beginner" },
    { lesson_type: "vocabulary", lesson_id: null, question: "What is the opposite of 'hot'?", options: ["Warm", "Cold", "Cool", "Spicy"], correct_answer: "Cold", explanation: "'Cold' is the opposite of 'hot'", difficulty: "beginner" },

    // ========== VOCABULARY - INTERMEDIATE ==========
    { lesson_type: "vocabulary", lesson_id: null, question: "What does 'passport' mean?", options: ["Hộ chiếu", "Vé máy bay", "Hành lý", "Khách sạn"], correct_answer: "Hộ chiếu", explanation: "'Passport' means 'hộ chiếu'", difficulty: "intermediate" },
    { lesson_type: "vocabulary", lesson_id: null, question: "'Doctor' in Vietnamese is ___?", options: ["Y tá", "Bác sĩ", "Bệnh nhân", "Dược sĩ"], correct_answer: "Bác sĩ", explanation: "'Doctor' means 'bác sĩ'", difficulty: "intermediate" },
    { lesson_type: "vocabulary", lesson_id: null, question: "What is the meaning of 'colleague'?", options: ["Sếp", "Đồng nghiệp", "Nhân viên", "Đối tác"], correct_answer: "Đồng nghiệp", explanation: "A 'colleague' is someone you work with", difficulty: "intermediate" },
    { lesson_type: "vocabulary", lesson_id: null, question: "'Salary' means ___?", options: ["Thưởng", "Lương", "Phụ cấp", "Thuế"], correct_answer: "Lương", explanation: "'Salary' means 'lương'", difficulty: "intermediate" },
    { lesson_type: "vocabulary", lesson_id: null, question: "What is 'sightseeing'?", options: ["Đi mua sắm", "Tham quan", "Nghỉ dưỡng", "Du lịch bụi"], correct_answer: "Tham quan", explanation: "'Sightseeing' means visiting tourist attractions", difficulty: "intermediate" },
    { lesson_type: "vocabulary", lesson_id: null, question: "Which word means 'đau đầu'?", options: ["Stomachache", "Headache", "Toothache", "Backache"], correct_answer: "Headache", explanation: "'Headache' means 'đau đầu'", difficulty: "intermediate" },
    { lesson_type: "vocabulary", lesson_id: null, question: "'Deadline' means ___?", options: ["Hạn chót", "Cuộc họp", "Hợp đồng", "Báo cáo"], correct_answer: "Hạn chót", explanation: "'Deadline' means 'hạn chót'", difficulty: "intermediate" },
    { lesson_type: "vocabulary", lesson_id: null, question: "What does 'promotion' mean in business?", options: ["Thăng chức", "Sa thải", "Nghỉ việc", "Tuyển dụng"], correct_answer: "Thăng chức", explanation: "'Promotion' means moving to a higher position", difficulty: "intermediate" },
    { lesson_type: "vocabulary", lesson_id: null, question: "'Download' means ___?", options: ["Tải lên", "Tải xuống", "Xóa", "Lưu"], correct_answer: "Tải xuống", explanation: "'Download' means to transfer data from the internet to your device", difficulty: "intermediate" },
    { lesson_type: "vocabulary", lesson_id: null, question: "What is the meaning of 'network'?", options: ["Máy tính", "Mạng", "Phần mềm", "Dữ liệu"], correct_answer: "Mạng", explanation: "'Network' means 'mạng' (computer network)", difficulty: "intermediate" },

    // ========== VOCABULARY - ADVANCED ==========
    { lesson_type: "vocabulary", lesson_id: null, question: "What does 'analyze' mean?", options: ["Tổng hợp", "Phân tích", "Đánh giá", "Mô tả"], correct_answer: "Phân tích", explanation: "'Analyze' means 'phân tích' in Vietnamese", difficulty: "advanced" },
    { lesson_type: "vocabulary", lesson_id: null, question: "What is the opposite of 'significant'?", options: ["Important", "Minor", "Major", "Large"], correct_answer: "Minor", explanation: "'Significant' means important; 'minor' is its opposite", difficulty: "advanced" },
    { lesson_type: "vocabulary", lesson_id: null, question: "'Hypothesis' means ___?", options: ["Kết luận", "Giả thuyết", "Phân tích", "Phương pháp"], correct_answer: "Giả thuyết", explanation: "'Hypothesis' means 'giả thuyết' in research", difficulty: "advanced" },
    { lesson_type: "vocabulary", lesson_id: null, question: "What is 'plagiarism'?", options: ["Trích dẫn", "Đạo văn", "Tham khảo", "Nghiên cứu"], correct_answer: "Đạo văn", explanation: "'Plagiarism' is using someone else's work without credit", difficulty: "advanced" },
    { lesson_type: "vocabulary", lesson_id: null, question: "'Revenue' means ___?", options: ["Lợi nhuận", "Doanh thu", "Chi phí", "Đầu tư"], correct_answer: "Doanh thu", explanation: "'Revenue' is total income before expenses", difficulty: "advanced" },
    { lesson_type: "vocabulary", lesson_id: null, question: "What does 'inflation' mean in economics?", options: ["Lạm phát", "Suy thoái", "Tăng trưởng", "Đầu tư"], correct_answer: "Lạm phát", explanation: "'Inflation' is the increase in prices over time", difficulty: "advanced" },
    { lesson_type: "vocabulary", lesson_id: null, question: "'Jurisdiction' means ___?", options: ["Hiến pháp", "Quyền tài phán", "Phán quyết", "Lời khai"], correct_answer: "Quyền tài phán", explanation: "'Jurisdiction' is the official power to make legal decisions", difficulty: "advanced" },
    { lesson_type: "vocabulary", lesson_id: null, question: "What is a 'protagonist'?", options: ["Nhân vật phản diện", "Nhân vật chính", "Tác giả", "Người kể chuyện"], correct_answer: "Nhân vật chính", explanation: "The 'protagonist' is the main character in a story", difficulty: "advanced" },
    { lesson_type: "vocabulary", lesson_id: null, question: "'Qualitative' research is about ___?", options: ["Số liệu", "Định tính", "Thí nghiệm", "Quan sát"], correct_answer: "Định tính", explanation: "'Qualitative' research deals with non-numerical data", difficulty: "advanced" },
    { lesson_type: "vocabulary", lesson_id: null, question: "'Sovereignty' means ___?", options: ["Chủ quyền", "Dân chủ", "Ngoại giao", "Hiến pháp"], correct_answer: "Chủ quyền", explanation: "'Sovereignty' is supreme power/authority of a state", difficulty: "advanced" },
    { lesson_type: "vocabulary", lesson_id: null, question: "What is 'empirical evidence'?", options: ["Bằng chứng lý thuyết", "Bằng chứng thực nghiệm", "Bằng chứng chủ quan", "Bằng chứng gián tiếp"], correct_answer: "Bằng chứng thực nghiệm", explanation: "'Empirical evidence' is based on observation/experiment", difficulty: "advanced" },
    { lesson_type: "vocabulary", lesson_id: null, question: "'Diversify' means ___?", options: ["Tập trung", "Đa dạng hóa", "Đầu tư", "Tiết kiệm"], correct_answer: "Đa dạng hóa", explanation: "'Diversify' means to make more varied", difficulty: "advanced" },

    // ========== ELECTRICAL ENGINEERING ==========
    { lesson_type: "vocabulary", lesson_id: null, question: "What is 'voltage'?", options: ["Dòng điện", "Điện áp", "Điện trở", "Công suất"], correct_answer: "Điện áp", explanation: "'Voltage' is the electrical potential difference measured in volts", difficulty: "advanced" },
    { lesson_type: "vocabulary", lesson_id: null, question: "'Resistance' is measured in ___?", options: ["Volts", "Amperes", "Ohms", "Watts"], correct_answer: "Ohms", explanation: "Resistance is measured in ohms (Ω)", difficulty: "advanced" },
    { lesson_type: "vocabulary", lesson_id: null, question: "A ___ allows current to flow in only one direction.", options: ["Resistor", "Capacitor", "Diode", "Transformer"], correct_answer: "Diode", explanation: "A diode acts as a one-way valve for electrical current", difficulty: "advanced" },
    { lesson_type: "vocabulary", lesson_id: null, question: "What does a transformer do?", options: ["Stores charge", "Changes voltage levels", "Amplifies signal", "Rectifies AC"], correct_answer: "Changes voltage levels", explanation: "A transformer steps voltage up or down using electromagnetic induction", difficulty: "advanced" },
    { lesson_type: "vocabulary", lesson_id: null, question: "'Oscilloscope' is used to ___?", options: ["Measure resistance", "Display waveforms", "Store energy", "Amplify signals"], correct_answer: "Display waveforms", explanation: "An oscilloscope displays electrical signal waveforms", difficulty: "advanced" },
    { lesson_type: "vocabulary", lesson_id: null, question: "A ___ converts AC to DC.", options: ["Transformer", "Oscillator", "Rectifier", "Amplifier"], correct_answer: "Rectifier", explanation: "A rectifier converts alternating current (AC) to direct current (DC)", difficulty: "advanced" },
    { lesson_type: "vocabulary", lesson_id: null, question: "'Impedance' is the AC equivalent of ___?", options: ["Voltage", "Current", "Resistance", "Power"], correct_answer: "Resistance", explanation: "Impedance extends the concept of resistance to AC circuits", difficulty: "advanced" },
    { lesson_type: "vocabulary", lesson_id: null, question: "'Arduino' is a type of ___?", options: ["Sensor", "Microcontroller", "Amplifier", "Power supply"], correct_answer: "Microcontroller", explanation: "Arduino is a popular microcontroller platform for electronics projects", difficulty: "advanced" },
    { lesson_type: "vocabulary", lesson_id: null, question: "What unit is current measured in?", options: ["Volts (V)", "Amperes (A)", "Ohms (Ω)", "Farads (F)"], correct_answer: "Amperes (A)", explanation: "Electric current is measured in amperes (amps)", difficulty: "advanced" },
    { lesson_type: "vocabulary", lesson_id: null, question: "'PWM' stands for ___?", options: ["Power Wave Modulation", "Pulse Width Modulation", "Phase Wave Modulation", "Pulse Width Multiplexing"], correct_answer: "Pulse Width Modulation", explanation: "PWM is used to control power to devices like motors and LEDs", difficulty: "advanced" },
  ];

  for (const ex of exercises) {
    db.run(
      "INSERT INTO exercises (lesson_type, lesson_id, question, options, correct_answer, explanation, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [ex.lesson_type, ex.lesson_id, ex.question, JSON.stringify(ex.options), ex.correct_answer, ex.explanation, ex.difficulty]
    );
  }

  // === IRREGULAR VERBS ===
  const irregularVerbs = [
    { base: "arise", past: "arose", pp: "arisen", meaning: "phát sinh, nảy sinh", example: "A new problem has arisen." },
    { base: "awake", past: "awoke", pp: "awoken", meaning: "thức dậy", example: "I awoke at 6 AM this morning." },
    { base: "be", past: "was/were", pp: "been", meaning: "thì, là, ở", example: "I have been to Hanoi." },
    { base: "bear", past: "bore", pp: "borne", meaning: "mang, chịu đựng", example: "She has borne the pain bravely." },
    { base: "beat", past: "beat", pp: "beaten", meaning: "đánh, đập", example: "He was beaten in the final match." },
    { base: "become", past: "became", pp: "become", meaning: "trở nên", example: "She became a teacher." },
    { base: "begin", past: "began", pp: "begun", meaning: "bắt đầu", example: "The meeting has begun." },
    { base: "bend", past: "bent", pp: "bent", meaning: "uốn cong", example: "He bent down to pick up the coin." },
    { base: "bet", past: "bet", pp: "bet", meaning: "cá cược", example: "I bet you can't do it." },
    { base: "bid", past: "bid", pp: "bid", meaning: "đấu giá", example: "She bid $100 for the painting." },
    { base: "bind", past: "bound", pp: "bound", meaning: "buộc, ràng buộc", example: "They are bound by the contract." },
    { base: "bite", past: "bit", pp: "bitten", meaning: "cắn", example: "The dog has bitten him." },
    { base: "bleed", past: "bled", pp: "bled", meaning: "chảy máu", example: "His nose bled heavily." },
    { base: "blow", past: "blew", pp: "blown", meaning: "thổi", example: "The wind has blown the leaves away." },
    { base: "break", past: "broke", pp: "broken", meaning: "làm vỡ, phá vỡ", example: "She broke the vase." },
    { base: "bring", past: "brought", pp: "brought", meaning: "mang đến", example: "He brought his friend to the party." },
    { base: "build", past: "built", pp: "built", meaning: "xây dựng", example: "They built a new house." },
    { base: "burn", past: "burnt/burned", pp: "burnt/burned", meaning: "đốt cháy", example: "The paper burned quickly." },
    { base: "burst", past: "burst", pp: "burst", meaning: "nổ tung", example: "The balloon burst." },
    { base: "buy", past: "bought", pp: "bought", meaning: "mua", example: "I bought a new car." },
    { base: "cast", past: "cast", pp: "cast", meaning: "ném, đúc", example: "He cast the net into the sea." },
    { base: "catch", past: "caught", pp: "caught", meaning: "bắt, chụp", example: "She caught the ball." },
    { base: "choose", past: "chose", pp: "chosen", meaning: "chọn", example: "I have chosen the blue one." },
    { base: "cling", past: "clung", pp: "clung", meaning: "bám vào", example: "The child clung to his mother." },
    { base: "come", past: "came", pp: "come", meaning: "đến", example: "She came to the party." },
    { base: "cost", past: "cost", pp: "cost", meaning: "có giá là", example: "This book cost $20." },
    { base: "creep", past: "crept", pp: "crept", meaning: "bò, trườn", example: "The cat crept toward the mouse." },
    { base: "cut", past: "cut", pp: "cut", meaning: "cắt", example: "He cut the paper." },
    { base: "deal", past: "dealt", pp: "dealt", meaning: "giải quyết", example: "She dealt with the problem." },
    { base: "dig", past: "dug", pp: "dug", meaning: "đào", example: "They dug a hole in the garden." },
    { base: "do", past: "did", pp: "done", meaning: "làm", example: "I have done my homework." },
    { base: "draw", past: "drew", pp: "drawn", meaning: "vẽ", example: "She drew a beautiful picture." },
    { base: "dream", past: "dreamt/dreamed", pp: "dreamt/dreamed", meaning: "mơ", example: "I dreamt of you last night." },
    { base: "drink", past: "drank", pp: "drunk", meaning: "uống", example: "He drank all the water." },
    { base: "drive", past: "drove", pp: "driven", meaning: "lái xe", example: "She has driven for 10 years." },
    { base: "eat", past: "ate", pp: "eaten", meaning: "ăn", example: "We ate lunch at noon." },
    { base: "fall", past: "fell", pp: "fallen", meaning: "ngã, rơi", example: "The leaves have fallen." },
    { base: "feed", past: "fed", pp: "fed", meaning: "cho ăn", example: "She fed the cat." },
    { base: "feel", past: "felt", pp: "felt", meaning: "cảm thấy", example: "I felt happy yesterday." },
    { base: "fight", past: "fought", pp: "fought", meaning: "chiến đấu", example: "They fought bravely." },
    { base: "find", past: "found", pp: "found", meaning: "tìm thấy", example: "I found my keys." },
    { base: "flee", past: "fled", pp: "fled", meaning: "chạy trốn", example: "The enemy fled." },
    { base: "fly", past: "flew", pp: "flown", meaning: "bay", example: "The bird has flown away." },
    { base: "forbid", past: "forbade", pp: "forbidden", meaning: "cấm", example: "Smoking is forbidden here." },
    { base: "forget", past: "forgot", pp: "forgotten", meaning: "quên", example: "I forgot her name." },
    { base: "forgive", past: "forgave", pp: "forgiven", meaning: "tha thứ", example: "She forgave him." },
    { base: "freeze", past: "froze", pp: "frozen", meaning: "đóng băng", example: "The water froze overnight." },
    { base: "get", past: "got", pp: "got/gotten", meaning: "có được, nhận", example: "I got a present from my mom." },
    { base: "give", past: "gave", pp: "given", meaning: "cho, tặng", example: "She gave me a book." },
    { base: "go", past: "went", pp: "gone", meaning: "đi", example: "They have gone to the store." },
    { base: "grow", past: "grew", pp: "grown", meaning: "phát triển, trồng", example: "The plant has grown tall." },
    { base: "hang", past: "hung", pp: "hung", meaning: "treo", example: "She hung the picture on the wall." },
    { base: "have", past: "had", pp: "had", meaning: "có", example: "I have had breakfast." },
    { base: "hear", past: "heard", pp: "heard", meaning: "nghe", example: "I heard a strange noise." },
    { base: "hide", past: "hid", pp: "hidden", meaning: "giấu, trốn", example: "The child hid behind the door." },
    { base: "hit", past: "hit", pp: "hit", meaning: "đánh, đập", example: "He hit the ball hard." },
    { base: "hold", past: "held", pp: "held", meaning: "cầm, tổ chức", example: "She held my hand tightly." },
    { base: "hurt", past: "hurt", pp: "hurt", meaning: "làm đau", example: "I hurt my leg." },
    { base: "keep", past: "kept", pp: "kept", meaning: "giữ", example: "She kept the secret." },
    { base: "kneel", past: "knelt", pp: "knelt", meaning: "quỳ", example: "He knelt down to pray." },
    { base: "know", past: "knew", pp: "known", meaning: "biết", example: "I have known her for years." },
    { base: "lay", past: "laid", pp: "laid", meaning: "đặt, để", example: "She laid the book on the table." },
    { base: "lead", past: "led", pp: "led", meaning: "dẫn dắt", example: "He led the team to victory." },
    { base: "lean", past: "leant/leaned", pp: "leant/leaned", meaning: "dựa vào", example: "She leant against the wall." },
    { base: "leap", past: "leapt/leaped", pp: "leapt/leaped", meaning: "nhảy", example: "The cat leapt onto the roof." },
    { base: "learn", past: "learnt/learned", pp: "learnt/learned", meaning: "học", example: "I learnt English at school." },
    { base: "leave", past: "left", pp: "left", meaning: "rời đi", example: "She left the office at 5 PM." },
    { base: "lend", past: "lent", pp: "lent", meaning: "cho mượn", example: "He lent me his car." },
    { base: "let", past: "let", pp: "let", meaning: "cho phép", example: "Let me help you." },
    { base: "lie", past: "lay", pp: "lain", meaning: "nằm", example: "He lay on the bed." },
    { base: "light", past: "lit", pp: "lit", meaning: "thắp sáng", example: "She lit the candle." },
    { base: "lose", past: "lost", pp: "lost", meaning: "mất, thua", example: "I lost my wallet." },
    { base: "make", past: "made", pp: "made", meaning: "làm, chế tạo", example: "She made a cake." },
    { base: "mean", past: "meant", pp: "meant", meaning: "có nghĩa là", example: "What did you mean?" },
    { base: "meet", past: "met", pp: "met", meaning: "gặp", example: "I met my friend yesterday." },
    { base: "pay", past: "paid", pp: "paid", meaning: "trả tiền", example: "She paid the bill." },
    { base: "put", past: "put", pp: "put", meaning: "đặt", example: "Put the book on the shelf." },
    { base: "quit", past: "quit", pp: "quit", meaning: "từ bỏ", example: "He quit his job." },
    { base: "read", past: "read", pp: "read", meaning: "đọc", example: "I have read that book." },
    { base: "ride", past: "rode", pp: "ridden", meaning: "cưỡi, đi (xe)", example: "She rode a horse." },
    { base: "ring", past: "rang", pp: "rung", meaning: "reo, gọi điện", example: "The phone rang." },
    { base: "rise", past: "rose", pp: "risen", meaning: "mọc, tăng lên", example: "The sun rises in the east." },
    { base: "run", past: "ran", pp: "run", meaning: "chạy", example: "He ran very fast." },
    { base: "say", past: "said", pp: "said", meaning: "nói", example: "She said hello to me." },
    { base: "see", past: "saw", pp: "seen", meaning: "thấy", example: "I have seen that movie." },
    { base: "seek", past: "sought", pp: "sought", meaning: "tìm kiếm", example: "They sought shelter from the rain." },
    { base: "sell", past: "sold", pp: "sold", meaning: "bán", example: "He sold his old car." },
    { base: "send", past: "sent", pp: "sent", meaning: "gửi", example: "I sent you an email." },
    { base: "set", past: "set", pp: "set", meaning: "đặt, thiết lập", example: "She set the table for dinner." },
    { base: "shake", past: "shook", pp: "shaken", meaning: "lắc", example: "He shook my hand." },
    { base: "shine", past: "shone", pp: "shone", meaning: "chiếu sáng", example: "The sun shone brightly." },
    { base: "shoot", past: "shot", pp: "shot", meaning: "bắn", example: "He shot the target." },
    { base: "show", past: "showed", pp: "shown", meaning: "cho xem", example: "She showed me the photo." },
    { base: "shrink", past: "shrank", pp: "shrunk", meaning: "co lại", example: "The shirt shrank in the wash." },
    { base: "shut", past: "shut", pp: "shut", meaning: "đóng", example: "Please shut the door." },
    { base: "sing", past: "sang", pp: "sung", meaning: "hát", example: "She sang a beautiful song." },
    { base: "sink", past: "sank", pp: "sunk", meaning: "chìm", example: "The ship sank." },
    { base: "sit", past: "sat", pp: "sat", meaning: "ngồi", example: "Please sit down." },
    { base: "sleep", past: "slept", pp: "slept", meaning: "ngủ", example: "I slept well last night." },
    { base: "slide", past: "slid", pp: "slid", meaning: "trượt", example: "The kids slid down the hill." },
    { base: "speak", past: "spoke", pp: "spoken", meaning: "nói", example: "She spoke English fluently." },
    { base: "spend", past: "spent", pp: "spent", meaning: "tiêu, dành", example: "I spent all my money." },
    { base: "spit", past: "spat", pp: "spat", meaning: "nhổ", example: "He spat on the ground." },
    { base: "split", past: "split", pp: "split", meaning: "chia tách", example: "They split the bill." },
    { base: "spread", past: "spread", pp: "spread", meaning: "lan truyền", example: "The news spread quickly." },
    { base: "spring", past: "sprang", pp: "sprung", meaning: "nhảy vọt", example: "He sprang out of bed." },
    { base: "stand", past: "stood", pp: "stood", meaning: "đứng", example: "Everyone stood up." },
    { base: "steal", past: "stole", pp: "stolen", meaning: "ăn cắp", example: "Someone stole my bike." },
    { base: "stick", past: "stuck", pp: "stuck", meaning: "dán, mắc kẹt", example: "The key stuck in the lock." },
    { base: "sting", past: "stung", pp: "stung", meaning: "đốt, châm", example: "A bee stung him." },
    { base: "strike", past: "struck", pp: "struck", meaning: "đánh, đình công", example: "The clock struck midnight." },
    { base: "swear", past: "swore", pp: "sworn", meaning: "thề", example: "He swore to tell the truth." },
    { base: "sweep", past: "swept", pp: "swept", meaning: "quét", example: "She swept the floor." },
    { base: "swim", past: "swam", pp: "swum", meaning: "bơi", example: "We swam in the lake." },
    { base: "take", past: "took", pp: "taken", meaning: "lấy", example: "Take a seat, please." },
    { base: "teach", past: "taught", pp: "taught", meaning: "dạy", example: "She taught me English." },
    { base: "tear", past: "tore", pp: "torn", meaning: "xé", example: "He tore the paper in half." },
    { base: "tell", past: "told", pp: "told", meaning: "kể, bảo", example: "Tell me a story." },
    { base: "think", past: "thought", pp: "thought", meaning: "nghĩ", example: "I think it's a good idea." },
    { base: "throw", past: "threw", pp: "thrown", meaning: "ném", example: "He threw the ball." },
    { base: "understand", past: "understood", pp: "understood", meaning: "hiểu", example: "I understood the lesson." },
    { base: "wake", past: "woke", pp: "woken", meaning: "đánh thức", example: "I woke up at 7 AM." },
    { base: "wear", past: "wore", pp: "worn", meaning: "mặc", example: "She wore a red dress." },
    { base: "weep", past: "wept", pp: "wept", meaning: "khóc", example: "She wept for hours." },
    { base: "win", past: "won", pp: "won", meaning: "thắng", example: "Our team won the match." },
    { base: "wind", past: "wound", pp: "wound", meaning: "quấn, lên dây", example: "She wound the clock." },
    { base: "withdraw", past: "withdrew", pp: "withdrawn", meaning: "rút tiền", example: "I withdrew $100 from the bank." },
    { base: "write", past: "wrote", pp: "written", meaning: "viết", example: "She wrote a letter." },
  ];

  for (const v of irregularVerbs) {
    db.run(
      "INSERT INTO irregular_verbs (base_form, past_simple, past_participle, meaning, example) VALUES (?, ?, ?, ?, ?)",
      [v.base, v.past, v.pp, v.meaning, v.example]
    );
  }

  await insertStressRules(db);
  db.run("DELETE FROM exercises WHERE lesson_type = 'stress'");
  const stressExercises = [
    // === Rule 1: Suffix stressed on itself (-ee, -eer, -ese, -ique, -aire) ===
    { question: "Từ 'employee' có trọng âm rơi vào âm tiết nào?", options: ["em-", "-ploy-", "-ee"], correct_answer: "-ee", explanation: "employee /ɪmˈplɔɪiː/ - hậu tố -ee nhận trọng âm" },
    { question: "Từ 'engineer' có trọng âm rơi vào âm tiết nào?", options: ["en-", "-gi-", "-neer"], correct_answer: "-neer", explanation: "engineer /ˌendʒɪˈnɪr/ - hậu tố -eer nhận trọng âm" },
    { question: "Từ 'Japanese' có trọng âm rơi vào âm tiết nào?", options: ["Ja-", "-pa-", "-nese"], correct_answer: "-nese", explanation: "Japanese /ˌdʒæpəˈniːz/ - hậu tố -ese nhận trọng âm" },
    { question: "Từ 'unique' có trọng âm rơi vào âm tiết nào?", options: ["u-", "-nique"], correct_answer: "-nique", explanation: "unique /juˈniːk/ - hậu tố -ique nhận trọng âm" },
    // === Rule 2: Stress on syllable before suffix (-ion, -ious, -ial, -ic, -ical) ===
    { question: "Từ 'education' có trọng âm rơi vào âm tiết nào?", options: ["ed-", "-u-", "-ca-", "-tion"], correct_answer: "-ca-", explanation: "education /ˌedʒuˈkeɪʃn/ - nhấn trước -tion: edu-CA-tion" },
    { question: "Từ 'delicious' có trọng âm rơi vào âm tiết nào?", options: ["de-", "-li-", "-cious"], correct_answer: "-li-", explanation: "delicious /dɪˈlɪʃəs/ - nhấn trước -cious: de-LI-cious" },
    { question: "Từ 'specific' có trọng âm rơi vào âm tiết nào?", options: ["spe-", "-ci-", "-fic"], correct_answer: "-ci-", explanation: "specific /spəˈsɪfɪk/ - nhấn trước -fic: spe-CI-fic" },
    { question: "Từ 'commercial' có trọng âm rơi vào âm tiết nào?", options: ["com-", "-mer-", "-cial"], correct_answer: "-mer-", explanation: "commercial /kəˈmɜːrʃl/ - nhấn trước -cial: com-MER-cial" },
    { question: "Từ 'courageous' có trọng âm rơi vào âm tiết nào?", options: ["cou-", "-ra-", "-geous"], correct_answer: "-ra-", explanation: "courageous /kəˈreɪdʒəs/ - nhấn trước -geous: cou-RA-geous" },
    // === Rule 3: Stress on antepenultimate (-ity, -ify, -graphy, -logy, -sophy) ===
    { question: "Từ 'activity' có trọng âm rơi vào âm tiết nào?", options: ["ac-", "-ti-", "-vi-", "-ty"], correct_answer: "-ti-", explanation: "activity /ækˈtɪvəti/ - nhấn âm thứ 3 từ cuối: ac-TI-vi-ty" },
    { question: "Từ 'biology' có trọng âm rơi vào âm tiết nào?", options: ["bi-", "-ol-", "-o-", "-gy"], correct_answer: "-ol-", explanation: "biology /baɪˈɒlədʒi/ - nhấn âm thứ 3 từ cuối: bi-OL-o-gy" },
    { question: "Từ 'identify' có trọng âm rơi vào âm tiết nào?", options: ["i-", "-den-", "-ti-", "-fy"], correct_answer: "-den-", explanation: "identify /aɪˈdentɪfaɪ/ - nhấn: i-DEN-ti-fy" },
    { question: "Từ 'geography' có trọng âm rơi vào âm tiết nào?", options: ["ge-", "-og-", "-ra-", "-phy"], correct_answer: "-og-", explanation: "geography /dʒiˈɒɡrəfi/ - nhấn âm thứ 3 từ cuối: ge-OG-ra-phy" },
    { question: "Từ 'philosophy' có trọng âm rơi vào âm tiết nào?", options: ["phi-", "-los-", "-o-", "-phy"], correct_answer: "-los-", explanation: "philosophy /fɪˈlɒsəfi/ - nhấn: phi-LOS-o-phy" },
    { question: "Từ 'possibility' có trọng âm rơi vào âm tiết nào?", options: ["pos-", "-si-", "-bi-", "-li-", "-ty"], correct_answer: "-bi-", explanation: "possibility /ˌpɒsəˈbɪləti/ - nhấn: pos-si-BI-li-ty" },
    // === Rule 4: Suffix doesn't change stress (-ment, -ness, -less, -ful, -ly, -ship) ===
    { question: "Từ 'government' có trọng âm rơi vào âm tiết nào?", options: ["gov-", "-ern-", "-ment"], correct_answer: "gov-", explanation: "government /ˈɡʌvərnmənt/ - hậu tố -ment không đổi trọng âm" },
    { question: "Từ 'beautiful' có trọng âm rơi vào âm tiết nào?", options: ["beau-", "-ti-", "-ful"], correct_answer: "beau-", explanation: "beautiful /ˈbjuːtɪfl/ - hậu tố -ful không đổi trọng âm" },
    { question: "Từ 'happiness' có trọng âm rơi vào âm tiết nào?", options: ["hap-", "-pi-", "-ness"], correct_answer: "hap-", explanation: "happiness /ˈhæpinəs/ - hậu tố -ness không đổi trọng âm" },
    { question: "Từ 'quickly' có trọng âm rơi vào âm tiết nào?", options: ["quick-", "-ly"], correct_answer: "quick-", explanation: "quickly /ˈkwɪkli/ - hậu tố -ly không đổi trọng âm" },
    { question: "Từ 'friendship' có trọng âm rơi vào âm tiết nào?", options: ["friend-", "-ship"], correct_answer: "friend-", explanation: "friendship /ˈfrendʃɪp/ - hậu tố -ship không đổi trọng âm" },
    // === Rule 5: -ate, -ize, -ish verbs ===
    { question: "Từ 'communicate' có trọng âm rơi vào âm tiết nào?", options: ["com-", "-mu-", "-ni-", "-cate"], correct_answer: "-mu-", explanation: "communicate /kəˈmjuːnɪkeɪt/ - nhấn: com-MU-ni-cate" },
    { question: "Từ 'apologize' có trọng âm rơi vào âm tiết nào?", options: ["a-", "-pol-", "-o-", "-gize"], correct_answer: "-pol-", explanation: "apologize /əˈpɒlədʒaɪz/ - nhấn: a-POL-o-gize" },
    { question: "Từ 'demonstrate' có trọng âm rơi vào âm tiết nào?", options: ["dem-", "-on-", "-strate"], correct_answer: "dem-", explanation: "demonstrate /ˈdemənstreɪt/ - nhấn: DEM-on-strate" },
    { question: "Từ 'English' có trọng âm rơi vào âm tiết nào?", options: ["Eng-", "-lish"], correct_answer: "Eng-", explanation: "English /ˈɪŋɡlɪʃ/ - tính từ -ish nhấn đầu" },
    // === Rule 6: Suffix stressed (-ade, -oo, -oon, -self, -elle) ===
    { question: "Từ 'lemonade' có trọng âm rơi vào âm tiết nào?", options: ["lem-", "-o-", "-nade"], correct_answer: "-nade", explanation: "lemonade /ˌleməˈneɪd/ - hậu tố -ade nhận trọng âm" },
    { question: "Từ 'kangaroo' có trọng âm rơi vào âm tiết nào?", options: ["kan-", "-ga-", "-roo"], correct_answer: "-roo", explanation: "kangaroo /ˌkæŋɡəˈruː/ - hậu tố -oo nhận trọng âm" },
    { question: "Từ 'typhoon' có trọng âm rơi vào âm tiết nào?", options: ["ty-", "-phoon"], correct_answer: "-phoon", explanation: "typhoon /taɪˈfuːn/ - hậu tố -oon nhận trọng âm" },
    { question: "Từ 'myself' có trọng âm rơi vào âm tiết nào?", options: ["my-", "-self"], correct_answer: "-self", explanation: "myself /maɪˈself/ - hậu tố -self nhận trọng âm" },
    // === Rule 7: -ing suffix keeps original stress ===
    { question: "Từ 'beginning' có trọng âm rơi vào âm tiết nào?", options: ["be-", "-gin-", "-ning"], correct_answer: "-gin-", explanation: "beGIN → beGINning (trọng âm giữ nguyên)" },
    { question: "Từ 'interesting' có trọng âm rơi vào âm tiết nào?", options: ["in-", "-ter-", "-est-", "-ing"], correct_answer: "in-", explanation: "INterest → INteresting (giữ nguyên trọng âm gốc)" },
    { question: "Từ 'relaxing' có trọng âm rơi vào âm tiết nào?", options: ["re-", "-lax-", "-ing"], correct_answer: "-lax-", explanation: "reLAX → reLAXing (trọng âm giữ nguyên)" },
    { question: "Cụm từ 'swimming pool' có trọng âm chính rơi vào từ nào?", options: ["swimming", "pool", "cả hai từ"], correct_answer: "swimming", explanation: "Danh từ ghép → nhấn phần đầu: 'SWIMMING pool" },
    { question: "Cụm từ 'waiting room' có trọng âm chính rơi vào từ nào?", options: ["waiting", "room", "cả hai từ"], correct_answer: "waiting", explanation: "Danh từ ghép → nhấn phần đầu: 'WAITING room" },
    // === Rule 8: Two-syllable words ending in -y, -ow, -le, -er ===
    { question: "Từ 'happy' có trọng âm rơi vào âm tiết nào?", options: ["hap-", "-py"], correct_answer: "hap-", explanation: "Tính từ 2 âm tiết -y: HAPpy" },
    { question: "Từ 'yellow' có trọng âm rơi vào âm tiết nào?", options: ["yel-", "-low"], correct_answer: "yel-", explanation: "2 âm tiết -ow: YELlow" },
    { question: "Từ 'table' có trọng âm rơi vào âm tiết nào?", options: ["ta-", "-ble"], correct_answer: "ta-", explanation: "2 âm tiết -le: TAble" },
    { question: "Từ 'teacher' có trọng âm rơi vào âm tiết nào?", options: ["teach-", "-er"], correct_answer: "teach-", explanation: "2 âm tiết -er: TEACHer" },
    // === Rule 9: Compound nouns & verbs ===
    { question: "Từ 'greenhouse' có trọng âm rơi vào âm tiết nào?", options: ["green-", "-house", "cả hai"], correct_answer: "green-", explanation: "Danh từ ghép: GREENhouse (nhấn phần đầu)" },
    { question: "Từ 'understand' có trọng âm rơi vào âm tiết nào?", options: ["un-", "-der-", "-stand"], correct_answer: "-stand", explanation: "Động từ ghép: under-STAND (nhấn phần sau)" },
    { question: "Từ 'airport' có trọng âm rơi vào âm tiết nào?", options: ["air-", "-port"], correct_answer: "air-", explanation: "Danh từ ghép: AIRport (nhấn phần đầu)" },
    { question: "Từ 'overlook' có trọng âm rơi vào âm tiết nào?", options: ["o-", "-ver-", "-look"], correct_answer: "-look", explanation: "Động từ ghép: over-LOOK (nhấn phần sau)" },
    // === Rule 10: -able, -ible, -al, -cian, -sian ===
    { question: "Từ 'comfortable' có trọng âm rơi vào âm tiết nào?", options: ["com-", "-for-", "-ta-", "-ble"], correct_answer: "com-", explanation: "comfortable /ˈkʌmftəbl/ - nhấn trước -able: COMfortable" },
    { question: "Từ 'possible' có trọng âm rơi vào âm tiết nào?", options: ["pos-", "-si-", "-ble"], correct_answer: "pos-", explanation: "possible /ˈpɒsəbl/ - nhấn trước -ible: POSsible" },
    { question: "Từ 'musician' có trọng âm rơi vào âm tiết nào?", options: ["mu-", "-si-", "-cian"], correct_answer: "-si-", explanation: "musician /mjuˈzɪʃn/ - nhấn trước -cian: mu-SIcian" },
    { question: "Từ 'national' có trọng âm rơi vào âm tiết nào?", options: ["na-", "-tion-", "-al"], correct_answer: "na-", explanation: "national /ˈnæʃənl/ - nhấn trước -al: NAtional" },
    // === Rule 11: Prefixes don't change stress ===
    { question: "Từ 'unhappy' có trọng âm rơi vào âm tiết nào?", options: ["un-", "-hap-", "-py"], correct_answer: "-hap-", explanation: "un-HAPpy - tiếp đầu ngữ un- không nhận trọng âm" },
    { question: "Từ 'rewrite' có trọng âm rơi vào âm tiết nào?", options: ["re-", "-write"], correct_answer: "-write", explanation: "re-WRITE - tiếp đầu ngữ re- không nhận trọng âm" },
    { question: "Từ 'disagree' có trọng âm rơi vào âm tiết nào?", options: ["dis-", "-a-", "-gree"], correct_answer: "-gree", explanation: "dis-a-GREE - tiếp đầu ngữ dis- không nhận trọng âm" },
    { question: "Từ 'overcome' có trọng âm rơi vào âm tiết nào?", options: ["o-", "-ver-", "-come"], correct_answer: "-come", explanation: "o-ver-COME - tiếp đầu ngữ over- không nhận trọng âm" },
  ];

  for (const ex of stressExercises) {
    db.run("INSERT INTO exercises (lesson_type, lesson_id, question, options, correct_answer, explanation, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?)",
      ["stress", null, ex.question, JSON.stringify(ex.options), ex.correct_answer, ex.explanation, "intermediate"]);
  }

  saveDb();
  console.log("Seed data created successfully!");
  console.log(`- ${topics.length} vocabulary topics`);
  console.log(`- ${grammarLessons.length} grammar lessons`);
  console.log(`- ${exercises.length} exercises`);
  console.log(`- ${irregularVerbs.length} irregular verbs`);
  console.log(`- ${stressRulesData.length} stress rules`);
}

seed().catch(console.error);
