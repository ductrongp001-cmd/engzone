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
import irregularVerbsRoutes from "./routes/irregular-verbs";
 
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
app.use("/api/irregular-verbs", irregularVerbsRoutes);

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

// Serve built frontend in production (fallback if client/dist exists)
const clientDist = path.join(__dirname, "../../client/dist");
if (require("fs").existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

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

async function updateGrammarContent() {
  const db = await getDb();

  const updates: Record<string, string> = {
    "Hiện tại đơn (Present Simple)": `The Present Simple is used for:
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
    "Hiện tại tiếp diễn (Present Continuous)": `The Present Continuous is used for:
• Actions happening now (I am reading now)
• Temporary situations (She is staying with friends)
• Future arrangements (We are meeting tomorrow)

Structure:
• Positive: Subject + am/is/are + V-ing
• Negative: Subject + am/is/are + not + V-ing
• Question: Am/Is/Are + Subject + V-ing?

Dấu hiệu nhận biết: now, right now, at the moment, at present, today, this week/month, Look!, Listen!, still`,
    "Quá khứ đơn (Past Simple)": `The Past Simple is used for:
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
    "Quá khứ tiếp diễn (Past Continuous)": `The Past Continuous is used for:
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
    "Hiện tại hoàn thành (Present Perfect)": `The Present Perfect is used for:
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
    "Hiện tại hoàn thành tiếp diễn (Present Perfect Continuous)": `The Present Perfect Continuous is used for:
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
    "Quá khứ hoàn thành (Past Perfect)": `The Past Perfect is used for:
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
    "Quá khứ hoàn thành tiếp diễn (Past Perfect Continuous)": `The Past Perfect Continuous is used for:
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
    "Câu điều kiện (Conditional Sentences)": `Zero Conditional (General truth):
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
    "Câu bị động (Passive Voice)": `The Passive Voice is used when:
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
    "Câu tường thuật (Reported Speech)": `Reported Speech is used to report what someone said without quoting directly.

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
    "Thể giả định (Subjunctive Mood)": `The Subjunctive Mood is used for:
• Wishes (I wish I were...)
• Suggestions (I suggest that he study...)
• Demands/Recommendations (It is essential that she be...)
• After "if only" (If only I knew...)

Key rules:
• "Were" is used for all persons (I wish I were... not "was")
• Verbs remain in base form (I suggest he go... not "goes")
• Common with: suggest, recommend, demand, insist, propose

Dấu hiệu nhận biết: wish, if only, would rather, as if/as though, suggest, recommend, demand, insist, propose, urge; các cấu trúc "It is + adj + that...": essential, important, necessary, vital`,
    "Tương lai đơn (Future Simple)": `The Future Simple is used for:
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
    "Tương lai tiếp diễn (Future Continuous)": `The Future Continuous is used for:
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
    "Tương lai hoàn thành (Future Perfect)": `The Future Perfect is used for:
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
    "Tương lai hoàn thành tiếp diễn (Future Perfect Continuous)": `The Future Perfect Continuous is used for:
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
    "Mạo từ (Articles: A/An/The)": `Articles are used before nouns.

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
    "Giới từ chỉ thời gian & nơi chốn (Prepositions of Time & Place)": `Prepositions of Time:

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
    "Mệnh đề quan hệ (Relative Clauses)": `Relative clauses give more information about a noun.

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
    "So sánh hơn & so sánh nhất (Comparatives & Superlatives)": `Used to compare things.

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
    "Động từ khiếm khuyết (Modal Verbs)": `Modal verbs are auxiliary verbs that express necessity, possibility, permission, or ability.

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
    "Danh động từ & Động từ nguyên mẫu (Gerunds & Infinitives)": `Gerund: V-ing (functions as a noun)
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
    "Cụm động từ (Phrasal Verbs)": `Phrasal verbs = verb + particle (preposition/adverb)
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
    "Từ nối (Linking Words & Connectors)": `Linking words connect ideas, sentences, and paragraphs.

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
    "Đảo ngữ & Nhấn mạnh (Inversion & Emphasis)": `Inversion is used for emphasis, often in formal/academic English.

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
    "Câu chẻ (Cleft Sentences)": `Cleft sentences divide a simple sentence into two parts for emphasis.

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
    "Câu điều kiện hỗn hợp (Mixed Conditionals)": `Mixed conditionals combine different conditional types.

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
    "Thể sai khiến (Causative Form)": `The causative is used when you arrange for someone else to do something for you.

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
    "Mệnh đề phân từ (Participle Clauses)": `Participle clauses use present (-ing) or past (-ed/-en) participles to shorten clauses.

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
    "Câu ước & Sự hối tiếc (Wishes & Regrets)": `Express wishes about the present, past, and future with different structures.

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
    "Lượng từ & Định từ (Quantifiers & Determiners)": `Quantifiers and determiners tell us how many or how much.

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
  };

  for (const [title, content] of Object.entries(updates)) {
    db.run("UPDATE grammar_lessons SET content = ? WHERE title = ?", [content, title]);
  }

  // Also update the 3 extra grammar lessons in addExtraContent
  const extraUpdates: Record<string, string> = {
    "Câu hỏi đuôi (Question Tags)": `Question tags are short questions added to the end of a statement.
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
• Falling tone → expecting agreement (sure)

Dấu hiệu nhận biết: câu hỏi đuôi luôn đi kèm dấu phẩy trước tag, động từ ở tag phải cùng thì với động từ chính. Chủ ngữ ở tag luôn là đại từ (you, he, she, it, they).`,
    "Tân ngữ trực tiếp & gián tiếp (Direct & Indirect Objects)": `Verbs can have direct objects (DO) and indirect objects (IO).

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
  - I gave it to her. (NOT: I gave her it)

Dấu hiệu nhận biết: các động từ đi với 2 tân ngữ: give, send, show, tell, offer, teach, lend, sell (IO đứng trước DO, hoặc DO + to + IO). Các động từ đi với for: buy, make, get, cook, find, keep (DO + for + IO). Explain, describe, suggest luôn dùng to (không có dạng V + IO + DO).`,
    "Trật tự từ trong câu (Word Order in English Sentences)": `English follows a strict word order: Subject - Verb - Object - Place - Time (SVOMPT)

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
• Indirect: Could you tell me where the station is? (no inversion)

Dấu hiệu nhận biết: trật tự SVOMPT (Subject-Verb-Object-Manner-Place-Time) luôn cố định. Frequency adverbs (always, never, usually, often, sometimes) đứng trước động từ thường nhưng sau động từ be. Câu hỏi gián tiếp không đảo ngữ. Thứ tự tính từ: OSAShCOMP (Opinion-Size-Age-Shape-Color-Origin-Material-Purpose).`,
  };

  for (const [title, content] of Object.entries(extraUpdates)) {
    db.run("UPDATE grammar_lessons SET content = ? WHERE title = ?", [content, title]);
  }

  saveDb();
  console.log(`Updated grammar content for ${Object.keys(updates).length + Object.keys(extraUpdates).length} lessons`);
}

async function addExtraContent() {
  const db = await getDb();

  // === IRREGULAR VERBS (for existing installations) ===
  const existingVerbs = db.exec("SELECT COUNT(*) as c FROM irregular_verbs");
  if (!existingVerbs[0]?.values[0]?.[0]) {
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
    saveDb();
    console.log(`Added ${irregularVerbs.length} irregular verbs`);
  }

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
      title: "Câu hỏi đuôi (Question Tags)",
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
• Falling tone → expecting agreement (sure)

Dấu hiệu nhận biết: câu hỏi đuôi luôn đi kèm dấu phẩy trước tag, động từ ở tag phải cùng thì với động từ chính. Chủ ngữ ở tag luôn là đại từ (you, he, she, it, they).`,
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
      title: "Tân ngữ trực tiếp & gián tiếp (Direct & Indirect Objects)",
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
  - I gave it to her. (NOT: I gave her it)

Dấu hiệu nhận biết: các động từ đi với 2 tân ngữ: give, send, show, tell, offer, teach, lend, sell (IO đứng trước DO, hoặc DO + to + IO). Các động từ đi với for: buy, make, get, cook, find, keep (DO + for + IO). Explain, describe, suggest luôn dùng to (không có dạng V + IO + DO).`,
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
      title: "Trật tự từ trong câu (Word Order in English Sentences)",
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
• Indirect: Could you tell me where the station is? (no inversion)

Dấu hiệu nhận biết: trật tự SVOMPT (Subject-Verb-Object-Manner-Place-Time) luôn cố định. Frequency adverbs (always, never, usually, often, sometimes) đứng trước động từ thường nhưng sau động từ be. Câu hỏi gián tiếp không đảo ngữ. Thứ tự tính từ: OSAShCOMP (Opinion-Size-Age-Shape-Color-Origin-Material-Purpose).`,
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
    "SELECT id FROM grammar_lessons WHERE title LIKE '%(Question Tags)%' OR title LIKE '%(Direct & Indirect Objects)%' OR title LIKE '%(Word Order in English Sentences)%' ORDER BY order_index"
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

async function translateGrammarTitles() {
  const db = await getDb();
  const titleMap: Record<string, string> = {
    "Present Simple Tense": "Hiện tại đơn (Present Simple)",
    "Present Continuous Tense": "Hiện tại tiếp diễn (Present Continuous)",
    "Conditional Sentences (If-clauses)": "Câu điều kiện (Conditional Sentences)",
    "Passive Voice": "Câu bị động (Passive Voice)",
    "Reported Speech": "Câu tường thuật (Reported Speech)",
    "Subjunctive Mood": "Thể giả định (Subjunctive Mood)",
    "Articles: A/An/The": "Mạo từ (Articles: A/An/The)",
    "Prepositions of Time & Place": "Giới từ chỉ thời gian & nơi chốn (Prepositions of Time & Place)",
    "Relative Clauses": "Mệnh đề quan hệ (Relative Clauses)",
    "Comparatives & Superlatives": "So sánh hơn & so sánh nhất (Comparatives & Superlatives)",
    "Modal Verbs": "Động từ khiếm khuyết (Modal Verbs)",
    "Gerunds & Infinitives": "Danh động từ & Động từ nguyên mẫu (Gerunds & Infinitives)",
    "Phrasal Verbs": "Cụm động từ (Phrasal Verbs)",
    "Linking Words & Connectors": "Từ nối (Linking Words & Connectors)",
    "Inversion & Emphasis": "Đảo ngữ & Nhấn mạnh (Inversion & Emphasis)",
    "Cleft Sentences": "Câu chẻ (Cleft Sentences)",
    "Mixed Conditionals": "Câu điều kiện hỗn hợp (Mixed Conditionals)",
    "Causative Form (Have/Get Something Done)": "Thể sai khiến (Causative Form)",
    "Participle Clauses": "Mệnh đề phân từ (Participle Clauses)",
    "Wishes & Regrets": "Câu ước & Sự hối tiếc (Wishes & Regrets)",
    "Quantifiers & Determiners": "Lượng từ & Định từ (Quantifiers & Determiners)",
    "Question Tags": "Câu hỏi đuôi (Question Tags)",
    "Direct & Indirect Objects": "Tân ngữ trực tiếp & gián tiếp (Direct & Indirect Objects)",
    "Word Order in English Sentences": "Trật tự từ trong câu (Word Order in English Sentences)",
  };
  for (const [oldTitle, newTitle] of Object.entries(titleMap)) {
    const existing = db.exec("SELECT id FROM grammar_lessons WHERE title = ? LIMIT 1", [oldTitle]);
    if (existing[0]?.values[0]?.[0]) {
      db.run("UPDATE grammar_lessons SET title = ? WHERE title = ?", [newTitle, oldTitle]);
    }
  }
  saveDb();
  console.log("Translated grammar lesson titles to Vietnamese");
}

async function restructureTenses() {
  const db = await getDb();
  const old = db.exec("SELECT id FROM grammar_lessons WHERE title IN ('Past Simple vs Present Perfect', 'Quá khứ đơn & Hiện tại hoàn thành (Past Simple vs Present Perfect)') LIMIT 1");
  if (!old[0]?.values[0]?.[0]) return; // already restructured

  // Delete old bundled lessons (check both old English and bilingual titles)
  db.run("DELETE FROM grammar_lessons WHERE title IN ('Past Simple vs Present Perfect', 'Future Tenses', 'Past Continuous & Past Perfect', 'Quá khứ đơn & Hiện tại hoàn thành (Past Simple vs Present Perfect)', 'Thì tương lai (Future Tenses)', 'Quá khứ tiếp diễn & Quá khứ hoàn thành (Past Continuous & Past Perfect)')");
  db.run("DELETE FROM grammar_examples WHERE lesson_id NOT IN (SELECT id FROM grammar_lessons)");

  // Insert 10 new tense lessons
  const newTenses = [
    { title: "Hiện tại hoàn thành (Present Perfect)", level: "intermediate", category: "Tenses", order_index: 3 },
    { title: "Hiện tại hoàn thành tiếp diễn (Present Perfect Continuous)", level: "intermediate", category: "Tenses", order_index: 4 },
    { title: "Quá khứ đơn (Past Simple)", level: "beginner", category: "Tenses", order_index: 5 },
    { title: "Quá khứ tiếp diễn (Past Continuous)", level: "intermediate", category: "Tenses", order_index: 6 },
    { title: "Quá khứ hoàn thành (Past Perfect)", level: "intermediate", category: "Tenses", order_index: 7 },
    { title: "Quá khứ hoàn thành tiếp diễn (Past Perfect Continuous)", level: "advanced", category: "Tenses", order_index: 8 },
    { title: "Tương lai đơn (Future Simple)", level: "beginner", category: "Tenses", order_index: 9 },
    { title: "Tương lai tiếp diễn (Future Continuous)", level: "intermediate", category: "Tenses", order_index: 10 },
    { title: "Tương lai hoàn thành (Future Perfect)", level: "advanced", category: "Tenses", order_index: 11 },
    { title: "Tương lai hoàn thành tiếp diễn (Future Perfect Continuous)", level: "advanced", category: "Tenses", order_index: 12 },
  ];
  for (const t of newTenses) {
    db.run("INSERT INTO grammar_lessons (title, content, level, category, order_index) VALUES (?, '', ?, ?, ?)",
      [t.title, t.level, t.category, t.order_index]);
  }

  // Update order_index of remaining non-tense lessons (+7)
  // IMPORTANT: process in DESCENDING order to avoid index collisions
  const orderMap: [number, number][] = [
    [24, 31], [23, 30], [22, 29], [21, 28], [20, 27], [19, 26], [18, 25],
    [17, 24], [16, 23], [15, 22], [14, 21], [13, 20],
    [12, 19], [11, 18], [10, 17],
    [7, 16], [6, 15], [5, 14], [4, 13],
  ];
  for (const [oldIdx, newIdx] of orderMap) {
    db.run("UPDATE grammar_lessons SET order_index = ? WHERE order_index = ?", [newIdx, oldIdx]);
  }
  saveDb();
  console.log("Restructured tenses: split bundled lessons into individual tenses");
}

async function fixOrderIndexes() {
  const db = await getDb();
  const lessonOrder: Record<string, number> = {
    "Hiện tại đơn (Present Simple)": 1,
    "Hiện tại tiếp diễn (Present Continuous)": 2,
    "Hiện tại hoàn thành (Present Perfect)": 3,
    "Hiện tại hoàn thành tiếp diễn (Present Perfect Continuous)": 4,
    "Quá khứ đơn (Past Simple)": 5,
    "Quá khứ tiếp diễn (Past Continuous)": 6,
    "Quá khứ hoàn thành (Past Perfect)": 7,
    "Quá khứ hoàn thành tiếp diễn (Past Perfect Continuous)": 8,
    "Tương lai đơn (Future Simple)": 9,
    "Tương lai tiếp diễn (Future Continuous)": 10,
    "Tương lai hoàn thành (Future Perfect)": 11,
    "Tương lai hoàn thành tiếp diễn (Future Perfect Continuous)": 12,
    "Câu điều kiện (Conditional Sentences)": 13,
    "Câu bị động (Passive Voice)": 14,
    "Câu tường thuật (Reported Speech)": 15,
    "Thể giả định (Subjunctive Mood)": 16,
    "Mạo từ (Articles: A/An/The)": 17,
    "Giới từ chỉ thời gian & nơi chốn (Prepositions of Time & Place)": 18,
    "Mệnh đề quan hệ (Relative Clauses)": 19,
    "So sánh hơn & so sánh nhất (Comparatives & Superlatives)": 20,
    "Động từ khiếm khuyết (Modal Verbs)": 21,
    "Danh động từ & Động từ nguyên mẫu (Gerunds & Infinitives)": 22,
    "Cụm động từ (Phrasal Verbs)": 23,
    "Từ nối (Linking Words & Connectors)": 24,
    "Đảo ngữ & Nhấn mạnh (Inversion & Emphasis)": 25,
    "Câu chẻ (Cleft Sentences)": 26,
    "Câu điều kiện hỗn hợp (Mixed Conditionals)": 27,
    "Thể sai khiến (Causative Form)": 28,
    "Mệnh đề phân từ (Participle Clauses)": 29,
    "Câu ước & Sự hối tiếc (Wishes & Regrets)": 30,
    "Lượng từ & Định từ (Quantifiers & Determiners)": 31,
    "Câu hỏi đuôi (Question Tags)": 32,
    "Tân ngữ trực tiếp & gián tiếp (Direct & Indirect Objects)": 33,
    "Trật tự từ trong câu (Word Order in English Sentences)": 34,
  };
  const rows = db.exec("SELECT id, title FROM grammar_lessons ORDER BY id");
  let changed = 0;
  for (const row of rows[0]?.values ?? []) {
    const id = row[0] as number;
    const title = row[1] as string;
    const correctOrder = lessonOrder[title];
    if (correctOrder) {
      db.run("UPDATE grammar_lessons SET order_index = ? WHERE id = ?", [correctOrder, id]);
      changed++;
    }
  }
  if (changed > 0) {
    saveDb();
    console.log(`Fixed order_index for ${changed} grammar lessons`);
  } else {
    console.log("Order indexes already correct, no fix needed");
  }
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
  await restructureTenses();
  await fixOrderIndexes();
  await translateGrammarTitles();
  await updateGrammarContent();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EngZone running on http://localhost:${PORT} (LAN: http://192.168.1.x:${PORT})`);
  });
}

start();
