import { useState } from "react";
import "./App.css";

const sensitiveKeywords = [
  "neeche",
  "pishab",
  "peshab",
  "mahwari",
  "period",
  "discharge",
  "jalan",
  "dard",
  "shohar",
  "hamal",
  "pregnant",
  "pregnancy",
  "safayi",
  "rasoli",
  "athra",
  "khoon",
  "bleeding",
  "vagina",
  "urine",
];

const starterMessages = [
  {
    sender: "assistant",
    text: "Assalam-o-Alaikum. Main pregnancy aur SRH ke sawalon mein madad ke liye aik demo assistant hoon.",
  },
  {
    sender: "assistant",
    text: "Agar sawal private ho sakta hai, main pehle privacy options samjha sakti hoon.",
  },
];

const quickQuestions = [
  "Mujhe pishab wali jaga jalan hoti hai",
  "Mujhe neechey wali jaga dard hai",
  "Aaj mujhe kya khana chahiye?",
];

const privacyGuides = {
  disappearing: {
    title: "Disappearing messages",
    subtitle: "Chat ka record kam rakhne ke liye",
    why:
      "Agar phone shared hai, disappearing messages sensitive chat ka record kam kar sakte hain.",
    steps: [
      "Is WhatsApp chat ko open karein.",
      "Upar chat/contact name par tap karein.",
      "Disappearing Messages par tap karein.",
      "24 hours, 7 days, ya 90 days mein se duration choose karein.",
      "Wapas chat mein aa kar sensitive sawal pooch sakti hain.",
    ],
    limitation:
      "Limitation: Koi message disappear hone se pehle parh sakta hai, screenshot le sakta hai, ya forward kar sakta hai.",
  },
  chatLock: {
    title: "Chat lock",
    subtitle: "Chat ko main list se hide karne ke liye",
    why:
      "Chat lock se yeh chat main chat list se hide ho sakti hai aur phone lock/PIN/fingerprint se open hoti hai.",
    steps: [
      "Is WhatsApp chat ko open karein.",
      "Upar chat/contact name par tap karein.",
      "Chat Lock option dhoondein.",
      "Lock this chat ko turn on karein.",
      "Locked chats ko phone lock, PIN, ya fingerprint se open karein.",
    ],
    limitation:
      "Limitation: Agar kisi aur ke paas aapka phone lock/PIN hai, woh locked chat dekh sakta hai.",
  },
  neutralNotifications: {
    title: "Neutral notifications",
    subtitle: "Sensitive lafz lock screen par na dikhane ke liye",
    why:
      "Shared phone par notification preview sensitive baat expose kar sakta hai. Neutral reminders is risk ko kam karte hain.",
    steps: [
      "Sensitive topic ke liye reminder ka neutral version choose karein.",
      "Example: “Health follow-up pending.”",
      "Doctor visit ya test reminder ko general words mein rakhein.",
      "Detailed medical baat sirf chat ya doctor summary mein rakhein.",
    ],
    limitation:
      "Limitation: WhatsApp notification settings phone aur app version ke hisaab se different ho sakti hain.",
  },
  deleteMessages: {
    title: "Delete messages",
    subtitle: "Par visible residue ka khayal rakhein",
    why:
      "Agar chat sensitive ho, user messages delete karna chah sakti hai. Lekin deletion ka trace kabhi kabhi suspicion create kar sakta hai.",
    steps: [
      "Message ko long press karein.",
      "Delete icon par tap karein.",
      "Delete for me ya Delete for everyone ka option dekhein.",
      "Sensitive context mein yeh sochna zaroori hai ke deletion ka trace visible hoga ya nahi.",
    ],
    limitation:
      "Limitation: Delete for everyone kabhi kabhi “message deleted” ka residue chhor deta hai.",
  },
  viewOnce: {
    title: "View once media",
    subtitle: "Reports/photos ko limited viewing ke liye",
    why:
      "Agar report, scan, ya photo sensitive hai, view once media se exposure kam ho sakta hai.",
    steps: [
      "Photo, report, ya scan attach karein.",
      "Send karne se pehle view-once icon select karein.",
      "Receiver media sirf aik dafa open kar sakega.",
      "Sensitive documents ke liye doctor-only sharing zyada safe ho sakti hai.",
    ],
    limitation:
      "Limitation: View once bhi full protection nahi hai. Kisi aur device se photo li ja sakti hai.",
  },
};

const responseStyles = {
  direct: {
    label: "Direct medical wording",
    description: "Zyada clear medical language. Doctor-facing ya private use ke liye.",
    response:
      "Yeh urinary infection ya vaginal infection ki wajah se ho sakta hai. Agar bukhar, khoon, badboo wali discharge, ya zyada dard ho to doctor ko jaldi dikhana zaroori hai.",
    exposureNote:
      "Exposure risk: Is response mein sensitive medical terms hain, is liye shared phone par yeh zyada visible ho sakta hai.",
  },
  simple: {
    label: "Simple Roman Urdu",
    description: "Aam lafzon mein jawab, lekin medical meaning clear rehta hai.",
    response:
      "Yeh infection se related ho sakta hai. Agar jalan zyada ho, khoon aaye, bukhar ho, ya smell/discharge ho to doctor ko dikhana behtar hai.",
    exposureNote:
      "Exposure risk: Moderate. Sensitive lafz kam hain, lekin health concern phir bhi visible hai.",
  },
  neutral: {
    label: "Neutral / family-safe wording",
    description: "Shared phone ke liye kam explicit wording.",
    response:
      "Yeh health follow-up ka issue ho sakta hai. Agar discomfort zyada ho ya symptoms barh rahe hon, doctor se check karwana behtar hai.",
    exposureNote:
      "Exposure risk: Lower. Yeh response sensitive anatomy ya SRH terms ko avoid karta hai.",
  },
  doctor: {
    label: "Doctor summary wording",
    description: "Doctor ko dikhane ke liye short clinical summary.",
    response:
      "Doctor summary: Patient reports lower urinary/vaginal burning or discomfort. Review for UTI or vaginal infection recommended. Full chat not included.",
    exposureNote:
      "Exposure risk: Clinical. Yeh summary doctor ke liye useful hai lekin shared phone par sensitive ho sakti hai.",
  },
};

function App() {
  const [screen, setScreen] = useState("home");
  const [messages, setMessages] = useState(starterMessages);
  const [input, setInput] = useState("");
  const [lastSensitiveQuestion, setLastSensitiveQuestion] = useState("");
  const [showPrivacyPrompt, setShowPrivacyPrompt] = useState(false);
  const [selectedGuideKey, setSelectedGuideKey] = useState("disappearing");
  const [selectedResponseStyle, setSelectedResponseStyle] = useState("neutral");
  const [selectedCleanup, setSelectedCleanup] = useState("");

  function detectSensitiveQuestion(text) {
    const lowerText = text.toLowerCase();
    return sensitiveKeywords.some((keyword) => lowerText.includes(keyword));
  }

  function sendMessage(customText) {
    const textToSend = customText || input.trim();
    if (!textToSend) return;

    const userMessage = {
      sender: "user",
      text: textToSend,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");

    if (detectSensitiveQuestion(textToSend)) {
      setLastSensitiveQuestion(textToSend);
      setShowPrivacyPrompt(true);

      setMessages((current) => [
        ...current,
        {
          sender: "assistant",
          text: "Yeh sawal private ho sakta hai. Agar aapka phone shared hai, main pehle privacy options samjha sakti hoon.",
        },
      ]);
    } else {
      setMessages((current) => [
        ...current,
        {
          sender: "assistant",
          text: "Pregnancy mein balanced diet important hoti hai. Daal, sabzi, doodh ya dahi, phal, pani, aur doctor ke diye hue vitamins ka khayal rakhein.",
        },
      ]);
    }
  }

  function openPrivacyCoach() {
    setShowPrivacyPrompt(false);
    setScreen("privacy-options");
  }

  function answerInNeutralWords() {
    setShowPrivacyPrompt(false);
    setSelectedResponseStyle("neutral");
    setScreen("answer");
  }

  function continueNormally() {
    setShowPrivacyPrompt(false);
    setSelectedResponseStyle("simple");
    setScreen("response-style");
  }

  function selectGuide(key) {
    setSelectedGuideKey(key);
    setScreen("guide");
  }

  function chooseResponseStyle(key) {
    setSelectedResponseStyle(key);
    setScreen("answer");
  }

  function finishCleanup(choice) {
    setSelectedCleanup(choice);
    setScreen("final");
  }

  function resetDemo() {
    setScreen("home");
    setMessages(starterMessages);
    setInput("");
    setLastSensitiveQuestion("");
    setShowPrivacyPrompt(false);
    setSelectedGuideKey("disappearing");
    setSelectedResponseStyle("neutral");
    setSelectedCleanup("");
  }

  return (
    <div className="app-shell">
      <div className="project-panel">
        <p className="eyebrow">Research Prototype</p>
        <h1>SehatSafe</h1>
        <p className="subtitle">
          A WhatsApp privacy coach for sensitive SRH chatbot conversations on
          shared or monitored phones.
        </p>

        <div className="research-notes">
          <h3>Prototype explores</h3>
          <ul>
            <li>Privacy nudges inside a WhatsApp-style SRH chatbot</li>
            <li>Step-by-step privacy guidance for existing WhatsApp features</li>
            <li>Neutral and family-safe response styles</li>
            <li>Cleanup suggestions after sensitive conversations</li>
          </ul>
        </div>

        <div className="limitation-card">
          <strong>Draft language note</strong>
          <p>
            Roman Urdu copy is provisional and would need validation by
            clinicians, native speakers, and target users.
          </p>
        </div>

        <button className="secondary-button" onClick={resetDemo}>
          Reset demo
        </button>
      </div>

      <main className="phone-frame">
        {screen === "home" && (
          <HomeScreen onStart={() => setScreen("scenario")} />
        )}

        {screen === "scenario" && (
          <ScenarioScreen
            onContinue={() => setScreen("chat")}
            onBack={() => setScreen("home")}
          />
        )}

        {screen === "chat" && (
          <ChatScreen
            messages={messages}
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
            quickQuestions={quickQuestions}
            showPrivacyPrompt={showPrivacyPrompt}
            openPrivacyCoach={openPrivacyCoach}
            answerInNeutralWords={answerInNeutralWords}
            continueNormally={continueNormally}
          />
        )}

        {screen === "privacy-options" && (
          <PrivacyOptionsScreen
            onSelectGuide={selectGuide}
            onSkip={() => setScreen("response-style")}
            onBack={() => setScreen("chat")}
          />
        )}

        {screen === "guide" && (
          <GuideScreen
            guide={privacyGuides[selectedGuideKey]}
            guideKey={selectedGuideKey}
            onNext={() => setScreen("response-style")}
            onBack={() => setScreen("privacy-options")}
          />
        )}

        {screen === "response-style" && (
          <ResponseStyleScreen
            onChoose={chooseResponseStyle}
            onBack={() => setScreen("privacy-options")}
          />
        )}

        {screen === "answer" && (
          <AnswerScreen
            lastSensitiveQuestion={lastSensitiveQuestion}
            selectedStyle={responseStyles[selectedResponseStyle]}
            onCleanup={() => setScreen("cleanup")}
            onStyleChange={() => setScreen("response-style")}
          />
        )}

        {screen === "cleanup" && (
          <CleanupScreen
            selectedStyle={responseStyles[selectedResponseStyle]}
            onFinish={finishCleanup}
            onBack={() => setScreen("answer")}
          />
        )}

        {screen === "final" && (
          <FinalScreen
            selectedCleanup={selectedCleanup}
            selectedStyle={responseStyles[selectedResponseStyle]}
            onRestart={resetDemo}
            onHome={() => setScreen("home")}
            onResearchSummary={() => setScreen("research-summary")}
          />
        )}

        {screen === "research-summary" && (
          <ResearchSummaryScreen
            onRestart={resetDemo}
            onHome={() => setScreen("home")}
          />
        )}
      </main>
    </div>
  );
}

function HomeScreen({ onStart }) {
  return (
    <section className="screen">
      <div className="wa-header static-header">
        <div className="avatar">S</div>
        <div>
          <p className="screen-label">WhatsApp-style demo</p>
          <h2>SehatSafe Assistant</h2>
        </div>
      </div>

      <div className="home-card">
        <h3>Privacy coach for SRH chats</h3>
        <p>
          Yeh prototype dikhata hai ke WhatsApp-based SRH chatbot sensitive
          sawalon par privacy guidance kaise de sakta hai.
        </p>
      </div>

      <div className="feature-grid">
        <div className="feature-card">
          <span>💬</span>
          <p>Sensitive question detection</p>
        </div>
        <div className="feature-card">
          <span>🔐</span>
          <p>WhatsApp privacy guides</p>
        </div>
        <div className="feature-card">
          <span>🧕</span>
          <p>Neutral/family-safe wording</p>
        </div>
        <div className="feature-card">
          <span>🧹</span>
          <p>After-chat cleanup checklist</p>
        </div>
      </div>

      <button className="primary-button" onClick={onStart}>
        Start WhatsApp demo
      </button>

      <p className="small-warning">
        Research prototype only. Not medical advice. Not affiliated with
        WhatsApp.
      </p>
    </section>
  );
}

function ScenarioScreen({ onContinue, onBack }) {
  return (
    <section className="screen">
      <div className="top-bar">
        <div>
          <p className="screen-label">Shared-phone scenario</p>
          <h2>Why privacy coaching matters</h2>
        </div>
        <span className="lock-badge">👥</span>
      </div>

      <div className="scenario-intro-card">
        <h3>Simulated user context</h3>
        <p>
          A woman wants to ask a sensitive pregnancy or SRH question through a
          WhatsApp-based health chatbot. Her phone may be shared, checked, or
          visible to family members.
        </p>
      </div>

      <div className="risk-stack">
        <div className="risk-card">
          <span>1</span>
          <div>
            <strong>Topic is socially sensitive</strong>
            <p>
              Questions about discharge, pain, sex, contraception, periods, or
              miscarriage may be difficult or shameful to discuss openly.
            </p>
          </div>
        </div>

        <div className="risk-card">
          <span>2</span>
          <div>
            <strong>Phone may not be fully private</strong>
            <p>
              Messages, notifications, media, or chat history may be seen by
              someone else using or checking the same phone.
            </p>
          </div>
        </div>

        <div className="risk-card">
          <span>3</span>
          <div>
            <strong>Privacy actions can create suspicion</strong>
            <p>
              Deleting messages or hiding chats may itself look suspicious in a
              household where privacy is socially monitored.
            </p>
          </div>
        </div>

        <div className="risk-card">
          <span>4</span>
          <div>
            <strong>Chatbot can scaffold, not control</strong>
            <p>
              Since the platform is WhatsApp-based, the bot cannot create its
              own private mode. It can guide users toward existing privacy
              options and use safer wording.
            </p>
          </div>
        </div>
      </div>

      <div className="design-focus-card">
        <p className="muted-label">Prototype focus</p>
        <h3>Conversational privacy scaffolding</h3>
        <p>
          The demo explores how a chatbot can detect sensitive moments, explain
          privacy options, offer neutral response styles, and suggest cleanup
          steps after a sensitive conversation.
        </p>
      </div>

      <div className="button-column">
        <button className="primary-button" onClick={onContinue}>
          Continue to WhatsApp chat
        </button>
        <button className="secondary-button" onClick={onBack}>
          Back
        </button>
      </div>
    </section>
  );
}

function ChatScreen({
  messages,
  input,
  setInput,
  sendMessage,
  quickQuestions,
  showPrivacyPrompt,
  openPrivacyCoach,
  answerInNeutralWords,
  continueNormally,
}) {
  return (
    <section className="screen chat-screen">
      <div className="wa-header">
        <div className="avatar">S</div>
        <div className="wa-title-block">
          <h2>SehatSafe</h2>
          <p>online · privacy-aware demo</p>
        </div>
        <div className="wa-icons">⋮</div>
      </div>

      <div className="draft-banner">
        Draft Roman Urdu copy — needs linguistic and clinical validation.
      </div>

      <div className="messages-area wa-bg">
        {messages.map((message, index) => (
          <ChatBubble key={index} message={message} />
        ))}

        {showPrivacyPrompt && (
          <div className="privacy-nudge-card">
            <p className="card-kicker">Privacy coach</p>
            <h3>Shared phone ka khayal?</h3>
            <p>
              Agar yeh phone family ke saath shared hai, aap pehle privacy
              options dekh sakti hain.
            </p>

            <button className="primary-button" onClick={openPrivacyCoach}>
              Privacy options samjhein
            </button>
            <button className="secondary-button" onClick={answerInNeutralWords}>
              Neutral lafzon mein jawab dein
            </button>
            <button className="text-button" onClick={continueNormally}>
              Continue normally
            </button>
          </div>
        )}
      </div>

      <div className="quick-questions">
        {quickQuestions.map((question) => (
          <button key={question} onClick={() => sendMessage(question)}>
            {question}
          </button>
        ))}
      </div>

      <div className="input-row">
        <button className="mic-button" aria-label="voice note">
          🎙️
        </button>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") sendMessage();
          }}
          placeholder="Roman Urdu mein sawal likhein..."
        />
        <button onClick={() => sendMessage()}>➤</button>
      </div>
    </section>
  );
}

function PrivacyOptionsScreen({ onSelectGuide, onSkip, onBack }) {
  const options = [
    {
      key: "chatLock",
      icon: "🔐",
      title: "Chat lock guide",
      text: "Chat ko main list se hide karne ka tariqa.",
    },
    {
      key: "disappearing",
      icon: "⏳",
      title: "Disappearing messages",
      text: "Sensitive chat ka visible record kam karne ka tariqa.",
    },
    {
      key: "neutralNotifications",
      icon: "🔔",
      title: "Neutral reminders",
      text: "Lock screen par sensitive lafz avoid karna.",
    },
    {
      key: "deleteMessages",
      icon: "🗑️",
      title: "Delete messages",
      text: "Delete karne se pehle residue aur suspicion ka khayal.",
    },
    {
      key: "viewOnce",
      icon: "🖼️",
      title: "View once media",
      text: "Reports/scans/photos ke liye limited-view sharing.",
    },
  ];

  return (
    <section className="screen">
      <div className="top-bar">
        <div>
          <p className="screen-label">Privacy coach</p>
          <h2>Chat safe rakhne ke options</h2>
        </div>
        <span className="lock-badge">🛡️</span>
      </div>

      <div className="home-card">
        <h3>Yeh app WhatsApp ko control nahi karti</h3>
        <p>
          Lekin chatbot user ko WhatsApp ke existing privacy features samjha
          sakta hai, aur apne jawab ko kam explicit bana sakta hai.
        </p>
      </div>

      <div className="guide-option-list">
        {options.map((option) => (
          <button key={option.key} onClick={() => onSelectGuide(option.key)}>
            <span className="option-icon">{option.icon}</span>
            <span>
              <strong>{option.title}</strong>
              <small>{option.text}</small>
            </span>
          </button>
        ))}
      </div>

      <div className="button-column">
        <button className="primary-button" onClick={onSkip}>
          Privacy guide skip karke jawab choose karein
        </button>
        <button className="secondary-button" onClick={onBack}>
          Back to chat
        </button>
      </div>
    </section>
  );
}

function GuideScreen({ guide, guideKey, onNext, onBack }) {
  return (
    <section className="screen">
      <div className="top-bar">
        <div>
          <p className="screen-label">Step-by-step guide</p>
          <h2>{guide.title}</h2>
          <p className="screen-subtitle">{guide.subtitle}</p>
        </div>
        <span className="lock-badge">📱</span>
      </div>

      <div className="home-card">
        <h3>Yeh kyun useful ho sakta hai?</h3>
        <p>{guide.why}</p>
      </div>

      <GuideVisual guideKey={guideKey} />

      <div className="concept-note">
        <strong>Prototype note</strong>
        <p>
          Yeh cards exact WhatsApp screenshots nahi hain. Yeh conceptual visual
          guide hai jo chatbot user ko bhej sakta hai. Real deployment mein
          images ko WhatsApp version, phone type, aur language ke hisaab se
          validate karna hoga.
        </p>
      </div>

      <div className="limitation-warning">
        <strong>Important limitation</strong>
        <p>{guide.limitation}</p>
      </div>

      <div className="button-column">
        <button className="primary-button" onClick={onNext}>
          Ab jawab ka style choose karein
        </button>
        <button className="secondary-button" onClick={onBack}>
          Back to privacy options
        </button>
      </div>
    </section>
  );
}

function GuideVisual({ guideKey }) {
  const visualCards = {
    disappearing: [
      {
        title: "1. Chat open karein",
        body: "Sensitive sawal poochne se pehle SehatSafe chat open karein.",
        items: ["SehatSafe", "Pregnancy / SRH help", "Tap chat name"],
      },
      {
        title: "2. Contact info",
        body: "Upar chat name par tap karke settings screen open karein.",
        items: ["Disappearing Messages", "Chat Lock", "Notifications"],
      },
      {
        title: "3. Timer choose karein",
        body: "Messages kitni der baad disappear hon, yeh choose karein.",
        chips: ["24 hours", "7 days", "90 days"],
      },
      {
        title: "4. Yaad rakhein",
        body: "Disappearing messages full protection nahi dete.",
        warning: "Screenshot, forwarding, ya jaldi read karna possible hai.",
        variant: "warning",
      },
    ],

    chatLock: [
      {
        title: "1. Chat name tap karein",
        body: "SehatSafe chat ke upar name par tap karein.",
        items: ["SehatSafe", "Contact info", "Privacy options"],
      },
      {
        title: "2. Chat Lock dhoondein",
        body: "Contact info mein Chat Lock option select karein.",
        items: ["Chat Lock", "Lock this chat", "Hidden from main list"],
      },
      {
        title: "3. Lock turn on karein",
        body: "Phone lock, PIN, ya fingerprint se chat access hogi.",
        chips: ["PIN", "Fingerprint", "Phone lock"],
      },
      {
        title: "4. Caution",
        body: "Agar phone lock shared hai, locked chat bhi fully private nahi.",
        warning: "Privacy depends on who knows the phone PIN.",
        variant: "warning",
      },
    ],

    neutralNotifications: [
      {
        title: "Avoid explicit notification",
        body: "Lock screen par sensitive SRH words expose ho sakte hain.",
        notification: "Vaginal discharge follow-up",
        variant: "danger",
      },
      {
        title: "Use neutral wording",
        body: "Same reminder ko general health words mein rakhein.",
        notification: "Health follow-up pending",
        variant: "safe",
      },
      {
        title: "Reminder example",
        body: "Doctor visit ya test reminder ko neutral bana sakte hain.",
        items: ["Check-in pending", "Health reminder", "Follow-up due"],
      },
      {
        title: "Caution",
        body: "Notification privacy phone settings par bhi depend karti hai.",
        warning: "Preview settings har phone par different ho sakti hain.",
        variant: "warning",
      },
    ],

    deleteMessages: [
      {
        title: "1. Message long press",
        body: "Sensitive message ko select karne ke liye long press karein.",
        items: ["Select message", "Delete icon", "More options"],
      },
      {
        title: "2. Delete option",
        body: "Delete for me ya Delete for everyone ka option aa sakta hai.",
        chips: ["Delete for me", "Delete for everyone"],
      },
      {
        title: "3. Residue risk",
        body: "Kabhi kabhi delete karne ke baad trace nazar aa sakta hai.",
        notification: "This message was deleted",
        variant: "danger",
      },
      {
        title: "4. Caution",
        body: "Visible deletion trace suspicion create kar sakta hai.",
        warning: "Deleting is useful, but not always invisible.",
        variant: "warning",
      },
    ],

    viewOnce: [
      {
        title: "1. Report attach karein",
        body: "Agar report, scan, ya photo send karni ho to attach karein.",
        items: ["Lab report", "Ultrasound scan", "Prescription photo"],
      },
      {
        title: "2. View once select karein",
        body: "Send karne se pehle view-once icon select karein.",
        chips: ["1", "View once", "Limited view"],
      },
      {
        title: "3. Doctor-only sharing",
        body: "Sensitive document sirf doctor ke liye mark kiya ja sakta hai.",
        items: ["Doctor only", "Do not forward", "Sensitive document"],
      },
      {
        title: "4. Caution",
        body: "View once bhi full protection nahi deta.",
        warning: "Kisi aur device se photo li ja sakti hai.",
        variant: "warning",
      },
    ],
  };

  const cards = visualCards[guideKey] || visualCards.disappearing;

  return (
    <div className="mock-visual-section">
      <p className="mock-section-label">Visual guide concept</p>

      <div className="mock-card-grid">
        {cards.map((card) => (
          <div
            className={`mock-phone-card ${card.variant ? card.variant : ""}`}
            key={card.title}
          >
            <div className="mock-phone-top">
              <span className="mock-dot"></span>
              <span>WhatsApp guide card</span>
            </div>

            <h4>{card.title}</h4>
            <p>{card.body}</p>

            {card.items && (
              <div className="mock-list">
                {card.items.map((item) => (
                  <div key={item} className="mock-list-item">
                    {item}
                  </div>
                ))}
              </div>
            )}

            {card.chips && (
              <div className="mock-chip-row">
                {card.chips.map((chip) => (
                  <span key={chip}>{chip}</span>
                ))}
              </div>
            )}

            {card.notification && (
              <div className="mock-notification">
                <small>Notification preview</small>
                <strong>{card.notification}</strong>
              </div>
            )}

            {card.warning && (
              <div className="mock-warning">
                <strong>!</strong>
                <span>{card.warning}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ResponseStyleScreen({ onChoose, onBack }) {
  const exposureLabels = {
    direct: {
      level: "Higher exposure",
      note: "Uses explicit SRH/medical terms. Better for private or doctor-facing contexts.",
    },
    simple: {
      level: "Medium exposure",
      note: "Uses simpler wording but still mentions health symptoms clearly.",
    },
    neutral: {
      level: "Lower exposure",
      note: "Avoids explicit SRH terms. Better for shared-phone situations.",
    },
    doctor: {
      level: "Clinical exposure",
      note: "Useful for doctor review, but should not be casually visible on a shared phone.",
    },
  };

  return (
    <section className="screen">
      <div className="top-bar">
        <div>
          <p className="screen-label">Response privacy</p>
          <h2>Same concern, different wording</h2>
        </div>
        <span className="lock-badge">✍️</span>
      </div>

      <div className="home-card">
        <h3>Why this matters</h3>
        <p>
          SRH answers can be medically useful but socially risky if seen by
          someone else on a shared phone. The chatbot can help users choose how
          explicit the response should be.
        </p>
      </div>

      <div className="comparison-scenario">
        <p className="muted-label">User question</p>
        <div className="scenario-bubble">
          Mujhe pishab wali jaga jalan hoti hai
        </div>
      </div>

      <div className="response-preview-list">
        {Object.entries(responseStyles).map(([key, style]) => (
          <button
            className={`response-preview-card ${key}`}
            key={key}
            onClick={() => onChoose(key)}
          >
            <div className="response-card-header">
              <strong>{style.label}</strong>
              <span>{exposureLabels[key].level}</span>
            </div>

            <p className="response-card-description">{style.description}</p>

            <div className="mini-response-box">{style.response}</div>

            <p className="exposure-mini-note">{exposureLabels[key].note}</p>
          </button>
        ))}
      </div>

      <button className="secondary-button" onClick={onBack}>
        Back
      </button>
    </section>
  );
}

function AnswerScreen({
  lastSensitiveQuestion,
  selectedStyle,
  onCleanup,
  onStyleChange,
}) {
  return (
    <section className="screen chat-screen">
      <div className="wa-header">
        <div className="avatar">S</div>
        <div className="wa-title-block">
          <h2>SehatSafe</h2>
          <p>safer wording selected</p>
        </div>
        <div className="wa-icons">⋮</div>
      </div>

      <div className="messages-area wa-bg">
        <ChatBubble
          message={{
            sender: "user",
            text: lastSensitiveQuestion || "Mujhe pishab wali jaga jalan hoti hai",
          }}
        />

        <div className="visibility-card">
          <p className="card-kicker">Selected response style</p>
          <h3>{selectedStyle.label}</h3>
          <p>{selectedStyle.description}</p>
        </div>

        <ChatBubble
          message={{
            sender: "assistant",
            text: selectedStyle.response,
          }}
        />

        <div className="exposure-note">
          <strong>Exposure note</strong>
          <p>{selectedStyle.exposureNote}</p>
        </div>

        <div className="privacy-nudge-card">
          <h3>Ab cleanup karna hai?</h3>
          <p>
            Sensitive chat ke baad user ko next privacy step choose karne ka
            option diya ja sakta hai.
          </p>
          <button className="primary-button" onClick={onCleanup}>
            Cleanup checklist dekhein
          </button>
          <button className="secondary-button" onClick={onStyleChange}>
            Response style change karein
          </button>
        </div>
      </div>
    </section>
  );
}

function CleanupScreen({ selectedStyle, onFinish, onBack }) {
  return (
    <section className="screen">
      <div className="top-bar">
        <div>
          <p className="screen-label">After-chat cleanup</p>
          <h2>Ab kya visible rehna chahiye?</h2>
        </div>
        <span className="lock-badge">🧹</span>
      </div>

      <div className="visibility-preview">
        <h3>Visibility preview</h3>

        <div className="preview-row">
          <span>Normal chat</span>
          <strong>Potentially visible</strong>
        </div>

        <div className="preview-row">
          <span>Reminder wording</span>
          <strong>“Health follow-up pending”</strong>
        </div>

        <div className="preview-row">
          <span>Doctor summary</span>
          <strong>
            {selectedStyle.label === "Doctor summary wording"
              ? "Clinical summary ready"
              : "Optional"}
          </strong>
        </div>

        <div className="preview-row">
          <span>Full sensitive chat</span>
          <strong>User should decide</strong>
        </div>
      </div>

      <div className="cleanup-list">
        <button onClick={() => onFinish("lock")}>
          <strong>Lock this chat</strong>
          <span>Best if phone is shared but user has private phone lock.</span>
        </button>

        <button onClick={() => onFinish("disappear")}>
          <strong>Turn on disappearing messages</strong>
          <span>Reduces visible chat record after selected duration.</span>
        </button>

        <button onClick={() => onFinish("neutral")}>
          <strong>Set neutral reminder</strong>
          <span>Reminder says only: “Health follow-up pending.”</span>
        </button>

        <button onClick={() => onFinish("delete")}>
          <strong>Delete sensitive messages</strong>
          <span>Useful, but deletion residue may still be visible.</span>
        </button>
      </div>

      <button className="secondary-button" onClick={onBack}>
        Back to answer
      </button>
    </section>
  );
}

function FinalScreen({
  selectedCleanup,
  selectedStyle,
  onRestart,
  onHome,
  onResearchSummary,
}) {
  const cleanupLabels = {
    lock: "Chat lock guide selected",
    disappear: "Disappearing messages guide selected",
    neutral: "Neutral reminder selected",
    delete: "Delete messages guide selected",
  };

  return (
    <section className="screen">
      <div className="top-bar">
        <div>
          <p className="screen-label">Demo complete</p>
          <h2>{cleanupLabels[selectedCleanup] || "Cleanup selected"}</h2>
        </div>
        <span className="status-pill">Done</span>
      </div>

      <div className="home-card">
        <h3>What this prototype demonstrates</h3>
        <p>
          A WhatsApp-based SRH chatbot may not control platform privacy, but it
          can scaffold privacy through nudges, guides, safer wording, and cleanup
          suggestions.
        </p>
      </div>

      <div className="summary-preview">
        <p className="muted-label">Selected answer style</p>
        <p>{selectedStyle.label}</p>
      </div>

      <div className="summary-preview">
        <p className="muted-label">Neutral notification example</p>
        <p>Health follow-up pending.</p>
      </div>

      <div className="summary-preview">
        <p className="muted-label">Key design idea</p>
        <p>
          Instead of assuming that privacy is a hidden settings problem, this
          prototype treats privacy as part of the conversation itself.
        </p>
      </div>

      <div className="button-column">
        <button className="primary-button" onClick={onResearchSummary}>
          View research mapping
        </button>
        <button className="secondary-button" onClick={onRestart}>
          Restart demo
        </button>
        <button className="secondary-button" onClick={onHome}>
          Home
        </button>
      </div>
    </section>
  );
}

function ResearchSummaryScreen({ onRestart, onHome }) {
  const mappings = [
    {
      implication: "Private Mode / low-residue conversations",
      prototypeFeature: "Privacy coach + cleanup checklist",
      explanation:
        "Because a WhatsApp chatbot cannot create its own true private mode, the prototype instead shows how the bot can guide users toward chat lock, disappearing messages, neutral reminders, and post-chat cleanup.",
    },
    {
      implication: "Privacy features should not be buried in menus",
      prototypeFeature: "Contextual privacy nudge",
      explanation:
        "When a sensitive SRH question is detected, privacy support appears immediately inside the chat instead of being hidden inside a settings page.",
    },
    {
      implication: "Immediate privacy visualization",
      prototypeFeature: "Visibility preview and response exposure labels",
      explanation:
        "The prototype shows what may remain visible: normal chat, reminder wording, doctor summary, and full sensitive chat. Response styles are also labeled by exposure level.",
    },
    {
      implication: "Low-literacy visual guidance",
      prototypeFeature: "WhatsApp-style visual guide cards",
      explanation:
        "The bot can send simple picture-like cards explaining how to use existing WhatsApp privacy features such as chat lock, disappearing messages, and view-once media.",
    },
    {
      implication: "Digital purdah / audience control",
      prototypeFeature: "Direct, simple, neutral, and doctor-facing wording",
      explanation:
        "The same sensitive concern can be phrased differently depending on who might see the phone: the user, a doctor, or family members.",
    },
    {
      implication: "Notification and residue risks",
      prototypeFeature: "Neutral reminder wording",
      explanation:
        "Instead of exposing sensitive SRH terms on a lock screen, the chatbot can suggest neutral reminders such as “Health follow-up pending.”",
    },
    {
      implication: "Content forwarding concerns",
      prototypeFeature: "View-once media and doctor-only document framing",
      explanation:
        "The prototype includes guidance for reports, scans, or photos that may be sensitive if forwarded or seen outside the clinical context.",
    },
    {
      implication: "Limits of platform privacy",
      prototypeFeature: "Limitation warnings",
      explanation:
        "Each guide states that WhatsApp privacy features do not fully prevent screenshots, forwarding, shared PIN access, or someone reading messages before they disappear.",
    },
  ];

  const futureWork = [
    "Validate Roman Urdu and Punjabi wording with native speakers and clinicians.",
    "Test whether privacy nudges feel helpful or suspicious in shared-phone households.",
    "Explore whether visual guides are understandable for low-literacy users.",
    "Add support for modded WhatsApp risk education, such as GB/FM WhatsApp limitations.",
    "Study when the chatbot should interrupt with privacy guidance versus answering directly.",
  ];

  return (
    <section className="screen research-summary-screen">
      <div className="top-bar">
        <div>
          <p className="screen-label">Research mapping</p>
          <h2>How the prototype uses the paper</h2>
        </div>
        <span className="lock-badge">🧩</span>
      </div>

      <div className="home-card">
        <h3>Design probe argument</h3>
        <p>
          This prototype translates privacy design implications into a
          WhatsApp-based SRH chatbot context. Since the bot cannot redesign
          WhatsApp, it acts as a privacy scaffold: it nudges, explains, adapts
          language, and helps users reduce visible traces.
        </p>
      </div>

      <div className="mapping-list">
        {mappings.map((item) => (
          <div className="mapping-card" key={item.implication}>
            <p className="muted-label">Design implication</p>
            <h3>{item.implication}</h3>

            <div className="mapping-arrow">↓</div>

            <p className="muted-label">Prototype inclusion</p>
            <h4>{item.prototypeFeature}</h4>
            <p>{item.explanation}</p>
          </div>
        ))}
      </div>

      <div className="future-work-card">
        <p className="muted-label">Future research questions</p>
        <h3>What this prototype does not solve yet</h3>
        <ul>
          {futureWork.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="button-column">
        <button className="primary-button" onClick={onRestart}>
          Restart demo
        </button>
        <button className="secondary-button" onClick={onHome}>
          Home
        </button>
      </div>
    </section>
  );
}

function ChatBubble({ message }) {
  return (
    <div
      className={
        message.sender === "user"
          ? "chat-bubble user-bubble"
          : "chat-bubble assistant-bubble"
      }
    >
      {message.text}
    </div>
  );
}

export default App;