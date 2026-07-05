import { getDb, saveDb } from "./database";
import { initSchema } from "./schema";

export async function runSeed() {
  await seed();
}

async function seed() {
  await initSchema();
  const db = await getDb();

  // Seed admin user
  const existing = db.exec("SELECT id FROM users WHERE email = ?", ["admin@engzone.com"]);
  if (!existing.length || !existing[0].values.length) {
    db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      ["Admin", "admin@engzone.com", "admin123", "admin"]);
  }

  // Seed regular user
  const existingUser = db.exec("SELECT id FROM users WHERE email = ?", ["user@engzone.com"]);
  if (!existingUser.length || !existingUser[0].values.length) {
    db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      ["Nguyen Van A", "user@engzone.com", "user123", "user"]);
  }

  // Clear existing data
  db.run("DELETE FROM user_vocabulary");
  db.run("DELETE FROM user_progress");
  db.run("DELETE FROM exercises");
  db.run("DELETE FROM grammar_examples");
  db.run("DELETE FROM grammar_lessons");
  db.run("DELETE FROM vocabulary_words");
  db.run("DELETE FROM vocabulary_topics");

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

  // === GRAMMAR LESSONS ===
  const grammarLessons = [
    {
      title: "Present Simple Tense",
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
  - Does she work here?`,
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
      title: "Present Continuous Tense",
      content: `The Present Continuous is used for:
• Actions happening now (I am reading now)
• Temporary situations (She is staying with friends)
• Future arrangements (We are meeting tomorrow)

Structure:
• Positive: Subject + am/is/are + V-ing
• Negative: Subject + am/is/are + not + V-ing
• Question: Am/Is/Are + Subject + V-ing?`,
      level: "beginner",
      category: "Tenses",
      order_index: 2,
      examples: [
        { sentence: "I am studying English right now.", translation: "Tôi đang học tiếng Anh ngay bây giờ.", explanation: "Action in progress now" },
        { sentence: "They are building a new hospital.", translation: "Họ đang xây một bệnh viện mới.", explanation: "Temporary action happening around now" },
      ]
    },
    {
      title: "Past Simple vs Present Perfect",
      content: `Past Simple:
• Completed action at a specific past time
• Structure: Subject + V2 (ed/irregular)
• Signal words: yesterday, last week, ago, in 2010

Present Perfect:
• Past action with present relevance
• Experience (Have you ever...?)
• Result in present (I have lost my keys)
• Unfinished time (today, this week)
• Structure: have/has + V3 (past participle)
• Signal words: ever, never, already, yet, just, since, for`,
      level: "intermediate",
      category: "Tenses",
      order_index: 3,
      examples: [
        { sentence: "I visited Paris in 2019.", translation: "Tôi đã thăm Paris vào năm 2019.", explanation: "Past Simple - specific time in the past" },
        { sentence: "I have visited Paris three times.", translation: "Tôi đã thăm Paris ba lần.", explanation: "Present Perfect - experience, no specific time" },
        { sentence: "She has already finished her homework.", translation: "Cô ấy đã làm xong bài tập rồi.", explanation: "Present Perfect - result in present" },
      ]
    },
    {
      title: "Conditional Sentences (If-clauses)",
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
• If I had studied, I would have passed.`,
      level: "intermediate",
      category: "Conditionals",
      order_index: 4,
      examples: [
        { sentence: "If I were you, I would accept the offer.", translation: "Nếu tôi là bạn, tôi sẽ chấp nhận lời đề nghị.", explanation: "Second conditional - unreal present situation" },
        { sentence: "If she studies hard, she will pass the exam.", translation: "Nếu cô ấy học chăm chỉ, cô ấy sẽ đỗ kỳ thi.", explanation: "First conditional - real future possibility" },
        { sentence: "If he had left earlier, he wouldn't have missed the bus.", translation: "Nếu anh ấy đi sớm hơn, anh ấy đã không lỡ xe buýt.", explanation: "Third conditional - unreal past" },
      ]
    },
    {
      title: "Passive Voice",
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
• Modals: can/must/should be + V3`,
      level: "intermediate",
      category: "Voice",
      order_index: 5,
      examples: [
        { sentence: "The report was written by the manager.", translation: "Báo cáo đã được viết bởi quản lý.", explanation: "Past Simple Passive" },
        { sentence: "English is spoken worldwide.", translation: "Tiếng Anh được nói trên toàn thế giới.", explanation: "Present Simple Passive - doer is irrelevant" },
        { sentence: "The meeting has been postponed.", translation: "Cuộc họp đã bị hoãn lại.", explanation: "Present Perfect Passive" },
      ]
    },
    {
      title: "Reported Speech",
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

Structure: He said (that) + clause`,
      level: "advanced",
      category: "Speech",
      order_index: 6,
      examples: [
        { sentence: 'She said, "I am tired." → She said that she was tired.', translation: "Cô ấy nói rằng cô ấy mệt.", explanation: "Present → Past tense backshift" },
        { sentence: '"I will call you tomorrow" → He said he would call me the next day.', translation: "Anh ấy nói sẽ gọi tôi vào ngày hôm sau.", explanation: "Will → Would, tomorrow → the next day" },
      ]
    },
    {
      title: "Subjunctive Mood",
      content: `The Subjunctive Mood is used for:
• Wishes (I wish I were...)
• Suggestions (I suggest that he study...)
• Demands/Recommendations (It is essential that she be...)
• After "if only" (If only I knew...)

Key rules:
• "Were" is used for all persons (I wish I were... not "was")
• Verbs remain in base form (I suggest he go... not "goes")
• Common with: suggest, recommend, demand, insist, propose`,
      level: "advanced",
      category: "Mood",
      order_index: 7,
      examples: [
        { sentence: "I wish I were rich.", translation: "Tôi ước gì mình giàu.", explanation: "Subjunctive after 'wish' - unreal present" },
        { sentence: "I suggest that he study harder.", translation: "Tôi đề nghị anh ấy học chăm chỉ hơn.", explanation: "Subjunctive after 'suggest' - base form 'study'" },
        { sentence: "It is essential that every student be present.", translation: "Điều cần thiết là mọi học sinh phải có mặt.", explanation: "Subjunctive after 'essential' - base form 'be'" },
      ]
    },
    {
      title: "Future Tenses",
      content: `Four main ways to talk about the future:

1. Will + V (Predictions, spontaneous decisions, promises)
   • It will rain tomorrow.
   • I'll help you with that.
   • I promise I will call you.

2. Going to + V (Plans, intentions, predictions with evidence)
   • I'm going to study medicine.
   • Look at those clouds! It's going to rain.

3. Present Continuous (Fixed arrangements)
   • I'm meeting my friend at 6 PM.
   • We're having a party next Saturday.

4. Present Simple (Schedules/Timetables)
   • The train leaves at 7 AM.
   • The store opens at 9 AM.

Future Continuous: will be + V-ing (Actions in progress at a future time)
  • This time tomorrow, I will be flying to Paris.

Future Perfect: will have + V3 (Completed actions by a future time)
  • By 2028, I will have graduated from university.`,
      level: "beginner",
      category: "Tenses",
      order_index: 8,
      examples: [
        { sentence: "I will call you when I arrive.", translation: "Tôi sẽ gọi bạn khi tôi đến.", explanation: "'Will' for a spontaneous promise" },
        { sentence: "She is going to buy a new car.", translation: "Cô ấy dự định mua một chiếc xe mới.", explanation: "'Going to' for a planned intention" },
        { sentence: "The conference starts at 9 AM tomorrow.", translation: "Hội nghị bắt đầu lúc 9 giờ sáng mai.", explanation: "Present Simple for scheduled events" },
        { sentence: "By next year, I will have saved enough money.", translation: "Vào năm sau, tôi sẽ đã tiết kiệm đủ tiền.", explanation: "Future Perfect for completed action by a future time" },
      ]
    },
    {
      title: "Past Continuous & Past Perfect",
      content: `Past Continuous: was/were + V-ing
• Actions in progress at a specific past time
  - I was watching TV at 8 PM last night.
• Interrupted actions
  - I was walking home when it started raining.
• Parallel actions in the past
  - While I was cooking, he was cleaning.

Past Perfect: had + V3
• Action completed before another past action
  - When I arrived, they had already left.
• The "earlier past" (past before the past)
  - She had studied English before she moved to the UK.

Past Perfect Continuous: had been + V-ing
• Duration before something in the past
  - They had been waiting for hours when the bus finally came.`,
      level: "intermediate",
      category: "Tenses",
      order_index: 9,
      examples: [
        { sentence: "I was reading when she called.", translation: "Tôi đang đọc sách thì cô ấy gọi.", explanation: "Past Continuous - interrupted action" },
        { sentence: "They were playing football while we were studying.", translation: "Họ đang chơi bóng đá trong khi chúng tôi đang học.", explanation: "Past Continuous - parallel actions" },
        { sentence: "By the time we arrived, the movie had already started.", translation: "Khi chúng tôi đến, phim đã bắt đầu rồi.", explanation: "Past Perfect - action before another past action" },
        { sentence: "She had been working there for five years before she quit.", translation: "Cô ấy đã làm việc ở đó được năm năm trước khi nghỉ.", explanation: "Past Perfect Continuous - duration before past" },
      ]
    },
    {
      title: "Articles: A/An/The",
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
• Sports: play football, tennis`,
      level: "beginner",
      category: "Grammar",
      order_index: 10,
      examples: [
        { sentence: "I bought a car yesterday. The car is red.", translation: "Tôi đã mua một chiếc xe hơi hôm qua. Chiếc xe màu đỏ.", explanation: "'A' for first mention, 'the' for specific reference" },
        { sentence: "She is an engineer.", translation: "Cô ấy là một kỹ sư.", explanation: "'An' before vowel sound in 'engineer'" },
        { sentence: "The sun rises in the east.", translation: "Mặt trời mọc ở phía đông.", explanation: "'The' for unique things (sun, east)" },
        { sentence: "I love music.", translation: "Tôi yêu âm nhạc.", explanation: "Zero article for general uncountable nouns" },
      ]
    },
    {
      title: "Prepositions of Time & Place",
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
• by bus, by car (method of transport)`,
      level: "beginner",
      category: "Grammar",
      order_index: 11,
      examples: [
        { sentence: "I wake up at 7 AM in the morning.", translation: "Tôi thức dậy lúc 7 giờ sáng.", explanation: "AT for specific time, IN for part of day" },
        { sentence: "My birthday is on March 15th.", translation: "Sinh nhật của tôi vào ngày 15 tháng 3.", explanation: "ON for specific dates" },
        { sentence: "She is waiting at the bus stop.", translation: "Cô ấy đang đợi ở trạm xe buýt.", explanation: "AT for a specific location point" },
        { sentence: "The cat is on the table.", translation: "Con mèo ở trên bàn.", explanation: "ON for surfaces" },
      ]
    },
    {
      title: "Relative Clauses",
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
  - The book (that/which) I read was interesting.`,
      level: "intermediate",
      category: "Grammar",
      order_index: 12,
      examples: [
        { sentence: "The student who studies hard will pass.", translation: "Học sinh nào học chăm chỉ sẽ đỗ.", explanation: "Defining clause with 'who' for people" },
        { sentence: "The car which I bought is very fast.", translation: "Chiếc xe tôi mua rất nhanh.", explanation: "Defining clause with 'which' for things" },
        { sentence: "My mother, who is 60, still works every day.", translation: "Mẹ tôi, người 60 tuổi, vẫn làm việc mỗi ngày.", explanation: "Non-defining clause with commas" },
        { sentence: "The house where I was born is now a museum.", translation: "Ngôi nhà nơi tôi sinh ra nay là bảo tàng.", explanation: "'Where' for places" },
      ]
    },
    {
      title: "Comparatives & Superlatives",
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
• This is the least interesting movie I've seen.`,
      level: "intermediate",
      category: "Grammar",
      order_index: 13,
      examples: [
        { sentence: "This car is faster than that one.", translation: "Chiếc xe này nhanh hơn chiếc kia.", explanation: "Comparative with short adjective 'fast'" },
        { sentence: "She is the most intelligent student in the class.", translation: "Cô ấy là học sinh thông minh nhất trong lớp.", explanation: "Superlative with long adjective 'intelligent'" },
        { sentence: "My brother is as tall as my father.", translation: "Anh trai tôi cao bằng bố tôi.", explanation: "Equal comparison with 'as...as'" },
        { sentence: "This is the best pizza I have ever eaten!", translation: "Đây là pizza ngon nhất tôi từng ăn!", explanation: "Irregular superlative 'the best'" },
      ]
    },
    {
      title: "Modal Verbs",
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
• Polite offers: Would you like some tea?`,
      level: "intermediate",
      category: "Grammar",
      order_index: 14,
      examples: [
        { sentence: "You must wear a helmet when riding a motorcycle.", translation: "Bạn phải đội mũ bảo hiểm khi đi xe máy.", explanation: "'Must' for strong obligation/rule" },
        { sentence: "She can speak three languages fluently.", translation: "Cô ấy có thể nói thông thạo ba thứ tiếng.", explanation: "'Can' for ability" },
        { sentence: "You should exercise regularly to stay healthy.", translation: "Bạn nên tập thể dục thường xuyên để giữ sức khỏe.", explanation: "'Should' for advice" },
        { sentence: "It might rain later, so bring an umbrella.", translation: "Trời có thể mưa sau đó, nên mang ô nhé.", explanation: "'Might' for possibility (~30-50% chance)" },
      ]
    },
    {
      title: "Gerunds & Infinitives",
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
  - I stopped to smoke. (I paused what I was doing to smoke)`,
      level: "advanced",
      category: "Grammar",
      order_index: 15,
      examples: [
        { sentence: "I enjoy listening to music while working.", translation: "Tôi thích nghe nhạc trong khi làm việc.", explanation: "'Enjoy' followed by gerund" },
        { sentence: "She decided to study abroad.", translation: "Cô ấy quyết định đi du học.", explanation: "'Decide' followed by infinitive" },
        { sentence: "I stopped smoking last year.", translation: "Tôi đã bỏ hút thuốc năm ngoái.", explanation: "'Stop + gerund' means quit an action" },
        { sentence: "Swimming is a great form of exercise.", translation: "Bơi lội là một hình thức tập thể dục tuyệt vời.", explanation: "Gerund as subject of sentence" },
      ]
    },
    {
      title: "Phrasal Verbs",
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
• Come up with = create/think of: He came up with a great idea.`,
      level: "advanced",
      category: "Vocabulary",
      order_index: 16,
      examples: [
        { sentence: "Please turn off the lights when you leave.", translation: "Làm ơn tắt đèn khi bạn rời đi.", explanation: "Separable phrasal verb 'turn off'" },
        { sentence: "I ran into my teacher at the supermarket.", translation: "Tôi tình cờ gặp giáo viên ở siêu thị.", explanation: "Inseparable phrasal verb 'run into' = meet by chance" },
        { sentence: "She gave up sugar for health reasons.", translation: "Cô ấy đã từ bỏ đường vì lý do sức khỏe.", explanation: "'Give up' = quit/stop doing something" },
        { sentence: "I am looking forward to the weekend.", translation: "Tôi đang mong chờ đến cuối tuần.", explanation: "'Look forward to' = anticipate with pleasure" },
      ]
    },
    {
      title: "Linking Words & Connectors",
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
  - Despite the rain, we went for a walk.`,
      level: "advanced",
      category: "Writing",
      order_index: 17,
      examples: [
        { sentence: "Although he was tired, he finished his work.", translation: "Mặc dù mệt, anh ấy vẫn hoàn thành công việc.", explanation: "'Although' for contrast/concession" },
        { sentence: "She studied hard; therefore, she got excellent grades.", translation: "Cô ấy học chăm chỉ; do đó, cô ấy đạt điểm xuất sắc.", explanation: "'Therefore' for cause and effect" },
        { sentence: "I will go to the party provided that I finish my homework.", translation: "Tôi sẽ đi dự tiệc với điều kiện là tôi làm xong bài tập.", explanation: "'Provided that' for condition" },
        { sentence: "He is very funny whereas his brother is serious.", translation: "Anh ấy rất hài hước trong khi anh trai thì nghiêm túc.", explanation: "'Whereas' for direct contrast" },
      ]
    },
    {
      title: "Inversion & Emphasis",
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
• Such was his anger that he couldn't speak.`,
      level: "advanced",
      category: "Style",
      order_index: 18,
      examples: [
        { sentence: "Never have I witnessed such dedication.", translation: "Chưa bao giờ tôi chứng kiến sự cống hiến như vậy.", explanation: "Inversion after negative adverbial 'never'" },
        { sentence: "Not only does she speak English, but she also writes poetry.", translation: "Cô ấy không chỉ nói tiếng Anh mà còn làm thơ.", explanation: "Inversion with 'not only... but also'" },
        { sentence: "Only when I graduated did I realize the value of education.", translation: "Chỉ khi tốt nghiệp tôi mới nhận ra giá trị của giáo dục.", explanation: "Inversion after 'only when'" },
      ]
    },
    // === NEW ADVANCED LESSONS ===
    {
      title: "Cleft Sentences",
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
• Create a dramatic effect`,
      level: "advanced",
      category: "Style",
      order_index: 19,
      examples: [
        { sentence: "It was Maria who won the first prize.", translation: "Chính Maria là người đã giành giải nhất.", explanation: "IT-cleft emphasizes the subject 'Maria'" },
        { sentence: "What I really need is a good rest.", translation: "Điều tôi thực sự cần là một kỳ nghỉ ngơi tốt.", explanation: "WH-cleft emphasizes the noun phrase after 'is'" },
        { sentence: "It was because of the traffic that we were late.", translation: "Chính vì kẹt xe mà chúng tôi đã đến trễ.", explanation: "IT-cleft emphasizing a reason/adverbial clause" },
      ]
    },
    {
      title: "Mixed Conditionals",
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
• Mixed: If I were rich, I would have bought that house. (present→past)`,
      level: "advanced",
      category: "Conditionals",
      order_index: 20,
      examples: [
        { sentence: "If I had taken that job, I would be living in London now.", translation: "Nếu tôi đã nhận công việc đó, bây giờ tôi đang sống ở London.", explanation: "Mixed conditional: past condition → present result" },
        { sentence: "If she weren't so shy, she would have spoken up.", translation: "Nếu cô ấy không quá nhút nhát, cô ấy đã lên tiếng rồi.", explanation: "Mixed conditional: present trait → past result" },
        { sentence: "If he had saved money, he wouldn't be in debt now.", translation: "Nếu anh ấy đã tiết kiệm tiền, bây giờ anh ấy không mắc nợ.", explanation: "Mixed conditional: past action → present situation" },
      ]
    },
    {
      title: "Causative Form (Have/Get Something Done)",
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
• Professional work: legal documents, medical checkups`,
      level: "advanced",
      category: "Grammar",
      order_index: 21,
      examples: [
        { sentence: "I need to have my passport renewed.", translation: "Tôi cần gia hạn hộ chiếu.", explanation: "Causative 'have something done' for arranging a service" },
        { sentence: "She had her wedding dress designed by a famous artist.", translation: "Cô ấy đã nhờ một nghệ sĩ nổi tiếng thiết kế váy cưới.", explanation: "Past causative: arranged for someone to design the dress" },
        { sentence: "The manager had his assistant prepare the report.", translation: "Quản lý đã bảo trợ lý chuẩn bị báo cáo.", explanation: "Active causative 'have + person + V': ask someone to do" },
      ]
    },
    {
      title: "Participle Clauses",
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
• Connecting related ideas smoothly`,
      level: "advanced",
      category: "Grammar",
      order_index: 22,
      examples: [
        { sentence: "Having finished all her homework, she went out to play.", translation: "Sau khi làm xong hết bài tập, cô ấy ra ngoài chơi.", explanation: "Perfect participle for action completed before the main action" },
        { sentence: "Built in the 18th century, the cathedral attracts many tourists.", translation: "Được xây dựng vào thế kỷ 18, nhà thờ thu hút nhiều khách du lịch.", explanation: "Past participle clause with passive meaning" },
        { sentence: "Walking along the beach, she found a beautiful shell.", translation: "Đi dọc bãi biển, cô ấy tìm thấy một vỏ sò đẹp.", explanation: "Present participle for simultaneous action" },
      ]
    },
    {
      title: "Wishes & Regrets",
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
• She might have asked for help. (but she didn't)`,
      level: "advanced",
      category: "Mood",
      order_index: 23,
      examples: [
        { sentence: "I wish I had paid more attention in class.", translation: "Tôi ước mình đã chú ý hơn trong lớp.", explanation: "Wish about the past: Past Perfect for regret" },
        { sentence: "If only I could speak English fluently!", translation: "Giá mà tôi có thể nói tiếng Anh trôi chảy!", explanation: "'If only' for strong wish about present inability" },
        { sentence: "I should have taken that job offer.", translation: "Đáng lẽ tôi nên nhận lời mời làm việc đó.", explanation: "'Should have' expresses regret about a past decision" },
      ]
    },
    {
      title: "Quantifiers & Determiners",
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
• Neither of the students was late.`,
      level: "advanced",
      category: "Grammar",
      order_index: 24,
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

  saveDb();
  console.log("Seed data created successfully!");
  console.log(`- ${topics.length} vocabulary topics`);
  console.log(`- ${grammarLessons.length} grammar lessons`);
  console.log(`- ${exercises.length} exercises`);
}

seed().catch(console.error);
