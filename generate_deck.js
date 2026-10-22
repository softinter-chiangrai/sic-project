const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.33" x 7.5"

// Color Palette (Midnight Executive & Clean Tech)
const C_DARK_BG = '0B132B';      // Deep rich navy
const C_NAVY = '1C2541';         // Dark secondary navy
const C_LIGHT_BG = 'F8FAFC';     // Clean off-white
const C_WHITE = 'FFFFFF';        // Crisp white
const C_TEXT_MAIN = '0F172A';    // Slate 900 for high readability
const C_TEXT_MUTED = '475569';   // Slate 600 for subtitles
const C_TEXT_LIGHT = 'E2E8F0';   // Slate 200 for dark slides
const C_PRIMARY = '1E3A8A';      // Professional Blue
const C_ACCENT = '0284C7';       // Ocean Blue Accent
const C_EMERALD = '0D9488';      // Teal / Success
const C_CORAL = 'E11D48';        // Rose / Pain point highlight
const C_CARD_BORDER = 'E2E8F0';  // Subtle card border
const C_CARD_BG = 'FFFFFF';

const FONT_HEAD = 'Arial';
const FONT_BODY = 'Calibri';

// Helper: Header on light slides
function addSlideHeader(slide, category, title, subtitle) {
  slide.addText(category.toUpperCase(), {
    x: 0.8, y: 0.5, w: 11.5, h: 0.3,
    fontFace: FONT_HEAD, fontSize: 11, bold: true, color: C_ACCENT,
    margin: 0
  });
  slide.addText(title, {
    x: 0.8, y: 0.8, w: 11.5, h: 0.6,
    fontFace: FONT_HEAD, fontSize: 24, bold: true, color: C_TEXT_MAIN,
    margin: 0
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.8, y: 1.4, w: 11.5, h: 0.4,
      fontFace: FONT_BODY, fontSize: 14, color: C_TEXT_MUTED,
      margin: 0
    });
  }
}

// ==========================================
// SLIDE 1: Title Slide (Dark Executive Theme)
// ==========================================
{
  const slide = pres.addSlide();
  slide.background = { color: C_DARK_BG };

  slide.addText('PROJECT PRESENTATION • FULL-CYCLE SDLC MANAGEMENT', {
    x: 1.0, y: 1.6, w: 11.3, h: 0.4,
    fontFace: FONT_HEAD, fontSize: 13, bold: true, color: '38BDF8',
    margin: 0
  });

  slide.addText('ระบบบริหารโครงการซอฟต์แวร์แบบครบวงจร', {
    x: 1.0, y: 2.1, w: 11.3, h: 1.2,
    fontFace: FONT_HEAD, fontSize: 36, bold: true, color: C_WHITE,
    margin: 0
  });

  slide.addText('Software Project Lifecycle Management & Traceability Platform\nเปลี่ยนความซับซ้อนให้เป็นความสำเร็จที่ควบคุมและตรวจสอบได้แบบ Real-time', {
    x: 1.0, y: 3.4, w: 11.3, h: 0.9,
    fontFace: FONT_BODY, fontSize: 18, color: '94A3B8',
    margin: 0
  });

  // Presenter Card
  slide.addShape(pres.ShapeType.roundRect, {
    x: 1.0, y: 5.0, w: 8.5, h: 1.5,
    fill: { color: C_NAVY },
    line: { color: '334155', width: 1 },
    rectRadius: 0.1
  });

  slide.addText('ผู้พัฒนา: นายภูรินทร์ สุขมั่น (ริน)', {
    x: 1.3, y: 5.2, w: 7.8, h: 0.4,
    fontFace: FONT_HEAD, fontSize: 16, bold: true, color: C_WHITE,
    margin: 0
  });

  slide.addText('สาขาวิทยาการคอมพิวเตอร์ คณะเทคโนโลยีสารสนเทศและการสื่อสาร มหาวิทยาลัยพะเยา\nบทบาท: Full-Stack Developer & Software Architecture', {
    x: 1.3, y: 5.7, w: 7.8, h: 0.6,
    fontFace: FONT_BODY, fontSize: 13, color: 'CBD5E1',
    margin: 0
  });

  slide.addNotes(
    "สคริปต์พูดหน้าปก:\n" +
    "สวัสดีครับพี่ๆ และคณะกรรมการทุกท่าน วันนี้ผมขอแนะนำ 'ระบบบริหารโครงการซอฟต์แวร์แบบครบวงจร' หรือ SoftFlow Platform ครับ\n" +
    "ระบบนี้สร้างขึ้นมาเพื่อแก้ Pain Point สำคัญที่ทีมพัฒนาซอฟต์แวร์มักเจอ นั่นคือการขาดจุดเชื่อมโยงข้อมูลตั้งแต่ Requirement จนถึงการส่งมอบงาน\n" +
    "วันนี้ผมจะสรุปภาพรวมและสถาปัตยกรรมระบบใน 3 ส่วนหลัก: ปัญหาและแนวคิด, โมดูลการทำงานหลัก, และสรุปผลลัพธ์พร้อม Live Demo ครับ"
  );
}

// ==========================================
// SLIDE 2: Presenter Profile (Clean & Professional)
// ==========================================
{
  const slide = pres.addSlide();
  slide.background = { color: C_LIGHT_BG };
  addSlideHeader(slide, 'Presenter Background', 'ประวัติผู้พัฒนาโครงการ', 'ความตั้งใจและขอบเขตงานในการพัฒนาโครงการตลอดระยะเวลาการฝึกงาน');

  const profileImgPath = path.resolve('assets_extracted/profile.jpeg');
  if (fs.existsSync(profileImgPath)) {
    slide.addImage({
      path: profileImgPath,
      x: 1.0, y: 2.1, w: 3.2, h: 4.3,
      sizing: { type: 'cover', w: 3.2, h: 4.3 }
    });
  }

  // Info Box 1: Personal Info
  slide.addShape(pres.ShapeType.roundRect, {
    x: 4.6, y: 2.1, w: 7.8, h: 1.3,
    fill: { color: C_CARD_BG },
    line: { color: C_CARD_BORDER, width: 1 },
    rectRadius: 0.1
  });
  slide.addText('ข้อมูลส่วนตัวและสถานศึกษา', {
    x: 4.9, y: 2.3, w: 7.2, h: 0.3,
    fontFace: FONT_HEAD, fontSize: 14, bold: true, color: C_PRIMARY,
    margin: 0
  });
  slide.addText('นายภูรินทร์ สุขมั่น (ริน) | นิสิตชั้นปีที่ 4 สาขาวิทยาการคอมพิวเตอร์ คณะ ICT มหาวิทยาลัยพะเยา', {
    x: 4.9, y: 2.7, w: 7.2, h: 0.5,
    fontFace: FONT_BODY, fontSize: 13, color: C_TEXT_MAIN,
    margin: 0
  });

  // Info Box 2: Scope & Role
  slide.addShape(pres.ShapeType.roundRect, {
    x: 4.6, y: 3.6, w: 7.8, h: 1.3,
    fill: { color: C_CARD_BG },
    line: { color: C_CARD_BORDER, width: 1 },
    rectRadius: 0.1
  });
  slide.addText('บทบาทและความรับผิดชอบในโครงการ', {
    x: 4.9, y: 3.8, w: 7.2, h: 0.3,
    fontFace: FONT_HEAD, fontSize: 14, bold: true, color: C_PRIMARY,
    margin: 0
  });
  slide.addText('ออกแบบสถาปัตยกรรม Full-Cycle SDLC, พัฒนา Frontend (Angular), Backend API (Spring Boot),\nระบบบริหารสิทธิ์ผู้ใช้ (Keycloak RBAC) และโมดูล AI สำหรับสร้าง Test Cases อัตโนมัติ', {
    x: 4.9, y: 4.2, w: 7.2, h: 0.5,
    fontFace: FONT_BODY, fontSize: 13, color: C_TEXT_MAIN,
    margin: 0
  });

  // Info Box 3: Project Goal
  slide.addShape(pres.ShapeType.roundRect, {
    x: 4.6, y: 5.1, w: 7.8, h: 1.3,
    fill: { color: C_CARD_BG },
    line: { color: C_CARD_BORDER, width: 1 },
    rectRadius: 0.1
  });
  slide.addText('เป้าหมายหลักของการนำเสนอ', {
    x: 4.9, y: 5.3, w: 7.2, h: 0.3,
    fontFace: FONT_HEAD, fontSize: 14, bold: true, color: C_PRIMARY,
    margin: 0
  });
  slide.addText('นำเสนอภาพรวมเชิงสถาปัตยกรรมและคุณค่าทางธุรกิจ เพื่อรองรับการนำไปใช้งานจริงใน Internal Project\nของบริษัท และตอบโจทย์เกณฑ์การประเมินโครงการระดับอุดมศึกษา', {
    x: 4.9, y: 5.7, w: 7.2, h: 0.5,
    fontFace: FONT_BODY, fontSize: 13, color: C_TEXT_MAIN,
    margin: 0
  });

  slide.addNotes(
    "สคริปต์พูดหน้านี้:\n" +
    "ในส่วนของประวัติผู้พัฒนา ผมภูรินทร์ หรือรินครับ ในโปรเจกต์นี้รับผิดชอบการออกแบบและพัฒนาระบบตั้งแต่ต้นจนจบ\n" +
    "เป้าหมายของการพรีเซนต์ในวันนี้คือการให้เห็นทั้งฝั่ง Business Value สำหรับทีมบริหาร และ Technical Architecture สำหรับทีมพัฒนาร่วมกันครับ"
  );
}

// ==========================================
// SLIDE 3: Executive Summary (One Page for Board & Professors)
// ==========================================
{
  const slide = pres.addSlide();
  slide.background = { color: C_LIGHT_BG };
  addSlideHeader(slide, 'Executive Overview', 'สรุปภาพรวมโครงการใน 1 หน้า (Executive Summary)', 'หัวใจสำคัญ: ปัญหาที่พบ โซลูชันที่สร้าง และคุณค่าทางธุรกิจที่ส่งมอบ');

  const cards = [
    {
      title: '1. ปัญหาเดิม (The Problem)',
      color: C_CORAL,
      points: [
        'ข้อมูลกระจัดกระจาย: Requirement อยู่ในแชต, Task อยู่ในบอร์ด, ER อยู่ในไฟล์อื่น',
        'แก้จุดหนึ่งพังอีกจุด: ขาด Impact Analysis เมื่อเปลี่ยน Requirement',
        'เสี่ยงงบบานปลาย: ควบคุม Manday และขอบเขต Change Request ไม่ได้',
        'ผู้บริหารตาบอด: มองไม่เห็นความล่าช้าจนกว่าจะถึงวันใกล้ส่งมอบ'
      ]
    },
    {
      title: '2. โซลูชัน (SoftFlow Platform)',
      color: C_PRIMARY,
      points: [
        'Single Source of Truth: รวมทุกระยะ SDLC ไว้บนแพลตฟอร์มเดียว',
        '100% Traceability: ผูก Requirement → DFD/ER → Task → Test Case',
        'Automatic Schema & Scripts: วาด ER ปุ๊บแปลงเป็น SQL DDL อัตโนมัติ',
        'AI-Assisted QA: วิเคราะห์ Spec และสร้าง Test Scenarios ในคลิกเดียว'
      ]
    },
    {
      title: '3. ผลลัพธ์ทางธุรกิจ (The Impact)',
      color: C_EMERALD,
      points: [
        'ลดความเสี่ยงโครงการ: รู้ล่วงหน้าทันทีเมื่องานมีแนวโน้มล่าช้า (Early Warning)',
        'ประหยัดเวลา SA & QA: ลดขั้นตอนการทำเอกสารซ้ำซ้อนลงมากกว่า 40%',
        'ส่งมอบงานได้อย่างมั่นใจ: ตรวจรับ (UAT Sign-off) ตาม Gate ชัดเจน',
        'Audit-Ready: บันทึก Versioning และประวัติการเปลี่ยนแปลงครบถ้วน'
      ]
    }
  ];

  cards.forEach((c, idx) => {
    const x = 0.8 + idx * 3.9;
    slide.addShape(pres.ShapeType.roundRect, {
      x, y: 2.1, w: 3.7, h: 4.8,
      fill: { color: C_CARD_BG },
      line: { color: c.color, width: 2 },
      rectRadius: 0.1
    });

    slide.addText(c.title, {
      x: x + 0.3, y: 2.4, w: 3.1, h: 0.5,
      fontFace: FONT_HEAD, fontSize: 16, bold: true, color: c.color,
      margin: 0
    });

    const bodyText = c.points.map(pt => ({ text: pt, options: { bullet: true, breakLine: true, fontSize: 13, color: C_TEXT_MAIN, fontFace: FONT_BODY, paraSpaceAfter: 12 } }));
    slide.addText(bodyText, {
      x: x + 0.3, y: 3.1, w: 3.1, h: 3.6,
      margin: 0
    });
  });

  slide.addNotes(
    "สคริปต์พูดหน้านี้ (จุดสำคัญที่สุดที่กรรมการและผู้บริหารต้องการเห็น):\n" +
    "หากจะสรุปโครงการนี้ในหน้าเดียว มี 3 เสาหลักครับ:\n" +
    "1. ปัญหาเดิมคือ ความไม่เชื่อมโยงกันของข้อมูล (Broken Traceability) เวลาแก้ requirement จุดหนึ่ง ส่งผลกระทบต่อทั้งฐานข้อมูลและเดดไลน์โดยไม่มีใครรู้\n" +
    "2. สิ่งที่ผมสร้างคือ แพลตฟอร์มที่เชื่อมข้อมูลทุกอย่างเป็นเส้นเดียว มี Impact Analysis แจ้งเตือนทันที และมี AI ช่วยสร้าง Test Case\n" +
    "3. ผลลัพธ์คือ องค์กรสามารถควบคุมต้นทุน Manday ได้จริง ลดความเสี่ยงในการผิดสัญญา และส่งมอบงานอย่างโปร่งใสครับ"
  );
}

// ==========================================
// SLIDE 4: The Core Problem - SDLC Pain Points
// ==========================================
{
  const slide = pres.addSlide();
  slide.background = { color: C_LIGHT_BG };
  addSlideHeader(slide, 'Problem Statement', 'ปัญหาคลาสสิกในการบริหารโปรเจกต์ซอฟต์แวร์', 'เหตุผลสำคัญที่ทำให้กว่า 60% ของโปรเจกต์ซอฟต์แวร์ส่งมอบช้าหรือเกินงบประมาณ');

  const pains = [
    {
      num: '01',
      title: 'เอกสารและข้อตกลงสูญหาย (Lost in Communication)',
      desc: 'Requirement และข้อตกลงสำคัญกระจายอยู่ตามแชต Line, Email หรือกระดาษจด ขาดระบบจัดเก็บศูนย์กลาง ทำให้เมื่อทีมงานเปลี่ยนหรือเวลาผ่านไป ขอบเขตงานเกิดความคลาดเคลื่อน'
    },
    {
      num: '02',
      title: 'แก้จุดหนึ่ง พังอีกจุด (Lack of Impact Analysis)',
      desc: 'เมื่อลูกค้าหรือทีมงานขอปรับ Requirement เพียงเล็กน้อย ขาดเครื่องมือประเมินว่ากระทบกับ Database Schema ตารางไหน หรือกระทบกับ Task ของใครบ้าง จนเกิด Ripple Effect ลุกลาม'
    },
    {
      num: '03',
      title: 'การบริหารงานแบบมองไม่เห็นปัญหา (The Blind Spot)',
      desc: 'ผู้บริหารและ PM เห็นแต่งานที่เสร็จบนหน้าบอร์ด แต่ไม่เห็น Dependency หรือ Hidden Delays จนกระทั่งถึงกำหนดส่งมอบ ทำให้แก้ปัญหาไม่ทันเวลา'
    },
    {
      num: '04',
      title: 'ส่งมอบและเบิกเงินยาก (Delivery & UAT Disputes)',
      desc: 'เมื่อไม่มีหลักฐานการ Sign-off และ Test Cases ที่ผูกกับ Requirement ที่ตกลงไว้แต่แรก การตรวจรับงาน (UAT) มักเกิดข้อโต้แย้ง ทำให้วางบิลและปิดโครงการล่าช้า'
    }
  ];

  pains.forEach((p, idx) => {
    const x = idx % 2 === 0 ? 0.8 : 6.8;
    const y = idx < 2 ? 2.1 : 4.4;

    slide.addShape(pres.ShapeType.roundRect, {
      x, y, w: 5.7, h: 2.0,
      fill: { color: C_CARD_BG },
      line: { color: C_CARD_BORDER, width: 1 },
      rectRadius: 0.1
    });

    slide.addText(p.num, {
      x: x + 0.3, y: y + 0.25, w: 0.8, h: 0.4,
      fontFace: FONT_HEAD, fontSize: 18, bold: true, color: C_CORAL,
      margin: 0
    });

    slide.addText(p.title, {
      x: x + 1.1, y: y + 0.25, w: 4.3, h: 0.4,
      fontFace: FONT_HEAD, fontSize: 14, bold: true, color: C_TEXT_MAIN,
      margin: 0
    });

    slide.addText(p.desc, {
      x: x + 0.3, y: y + 0.8, w: 5.1, h: 1.0,
      fontFace: FONT_BODY, fontSize: 12.5, color: C_TEXT_MUTED,
      margin: 0
    });
  });

  slide.addNotes(
    "สคริปต์พูดหน้านี้:\n" +
    "ในการทำงานจริง เรามักเจอปัญหาวงจรอุบาทว์ 4 ข้อนี้ครับ:\n" +
    "เริ่มจากข้อตกลงที่กระจัดกระจาย ทำให้ขอบเขตงานไม่นิ่ง\n" +
    "ตามมาด้วยการเปลี่ยนสเปกที่ประเมินผลกระทบไม่ได้ ทำให้ระบบพังเป็นลูกโซ่\n" +
    "ผู้บริหารไม่เห็นปัญหาจนวินาทีสุดท้าย และสุดท้ายคือการส่งมอบงานที่ไม่จบสิ้นครับ"
  );
}

// ==========================================
// SLIDE 5: Business Impact (Metrics & Cost)
// ==========================================
{
  const slide = pres.addSlide();
  slide.background = { color: C_LIGHT_BG };
  addSlideHeader(slide, 'Business Impact', 'ผลกระทบเชิงธุรกิจเมื่อขาดระบบควบคุมที่มีประสิทธิภาพ', 'ความเสียหายที่ประเมินค่าได้เมื่อการควบคุมกระบวนการ SDLC ขาดความรัดกุม');

  const stats = [
    {
      badge: 'TIMELINE',
      metric: '30-50%',
      title: 'โครงการส่งมอบล่าช้ากว่ากำหนด',
      desc: 'เกิดจากการทำงานซ้ำซ้อน (Rework) และการแก้บั๊กที่หลุดรอดมาจากขั้นตอน Requirement ที่ไม่เคลียร์'
    },
    {
      badge: 'COST & BUDGET',
      metric: '2.5x',
      title: 'ต้นทุน Manday บานปลาย',
      desc: 'การแก้ไข Requirement ในขั้นตอนหลัง (Post-Development) ใช้ต้นทุนและเวลามากกว่าการแก้ในขั้นตอนแรกถึงหลายเท่า'
    },
    {
      badge: 'COMPLIANCE',
      metric: '0%',
      title: 'ขาดหลักฐาน Traceability',
      desc: 'เมื่อลูกค้าขอ Audit หรือเกิดข้อพิพาท ไม่สามารถชี้แจงได้ว่าโค้ดบรรทัดนี้ หรือฟีเจอร์นี้ มาจากสัญญาข้อใด'
    }
  ];

  stats.forEach((s, idx) => {
    const x = 0.8 + idx * 3.9;
    slide.addShape(pres.ShapeType.roundRect, {
      x, y: 2.1, w: 3.7, h: 4.8,
      fill: { color: C_CARD_BG },
      line: { color: C_CARD_BORDER, width: 1 },
      rectRadius: 0.1
    });

    slide.addText(s.badge, {
      x: x + 0.3, y: 2.4, w: 3.1, h: 0.3,
      fontFace: FONT_HEAD, fontSize: 11, bold: true, color: C_ACCENT,
      margin: 0
    });

    slide.addText(s.metric, {
      x: x + 0.3, y: 2.8, w: 3.1, h: 0.8,
      fontFace: FONT_HEAD, fontSize: 36, bold: true, color: C_CORAL,
      margin: 0
    });

    slide.addText(s.title, {
      x: x + 0.3, y: 3.8, w: 3.1, h: 0.6,
      fontFace: FONT_HEAD, fontSize: 16, bold: true, color: C_TEXT_MAIN,
      margin: 0
    });

    slide.addText(s.desc, {
      x: x + 0.3, y: 4.5, w: 3.1, h: 2.0,
      fontFace: FONT_BODY, fontSize: 13, color: C_TEXT_MUTED,
      margin: 0
    });
  });

  slide.addNotes(
    "สคริปต์พูดหน้านี้:\n" +
    "ผลกระทบเหล่านี้ไม่ใช่เรื่องไกลตัวครับ งานวิจัยด้าน Software Engineering ยืนยันว่า ปัญหาที่เกิดจาก Requirement ที่ผิดพลาดจะส่งผลให้ต้นทุนในการแก้ไขพุ่งสูงขึ้นถึงหลายเท่าตัว\n" +
    "และที่สำคัญที่สุดคือ ความน่าเชื่อถือขององค์กรในสายตาลูกค้าครับ"
  );
}

// ==========================================
// SLIDE 6: The Solution - All-in-One Pipeline
// ==========================================
{
  const slide = pres.addSlide();
  slide.background = { color: C_LIGHT_BG };
  addSlideHeader(slide, 'Solution Architecture', 'วงจรการทำงานแบบครบวงจร (All-in-One SDLC Pipeline)', 'เชื่อมโยงข้อมูลตั้งแต่ต้นน้ำถึงปลายน้ำเป็นเส้นเดียว (End-to-End Traceability)');

  const steps = [
    { step: 'Step 1', title: 'สัญญา & ลูกค้า', sub: 'Contracts & Client Profile' },
    { step: 'Step 2', title: 'รวบรวมสเปก', sub: 'Requirement & Scope Gate' },
    { step: 'Step 3', title: 'วิเคราะห์ & ออกแบบ', sub: 'DFD / ER & Schema Gen' },
    { step: 'Step 4', title: 'วางแผนงาน', sub: 'Milestone & Manday Budget' },
    { step: 'Step 5', title: 'พัฒนา & ติดตาม', sub: 'Kanban & Dependency' },
    { step: 'Step 6', title: 'ทดสอบระบบ', sub: 'QA & AI Test Case' },
    { step: 'Step 7', title: 'ตรวจรับ & ส่งมอบ', sub: 'UAT Sign-off & Delivery' }
  ];

  steps.forEach((st, idx) => {
    const x = 0.8 + idx * 1.67;
    slide.addShape(pres.ShapeType.roundRect, {
      x, y: 2.3, w: 1.55, h: 3.6,
      fill: { color: C_CARD_BG },
      line: { color: C_ACCENT, width: 1.5 },
      rectRadius: 0.1
    });

    slide.addText(st.step, {
      x, y: 2.5, w: 1.55, h: 0.3,
      fontFace: FONT_HEAD, fontSize: 12, bold: true, color: C_ACCENT, align: 'center',
      margin: 0
    });

    slide.addText(st.title, {
      x: x + 0.1, y: 3.0, w: 1.35, h: 0.8,
      fontFace: FONT_HEAD, fontSize: 14, bold: true, color: C_TEXT_MAIN, align: 'center',
      margin: 0
    });

    slide.addText(st.sub, {
      x: x + 0.1, y: 3.9, w: 1.35, h: 1.5,
      fontFace: FONT_BODY, fontSize: 11, color: C_TEXT_MUTED, align: 'center',
      margin: 0
    });
  });

  // Highlight Banner at bottom
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 6.1, w: 11.7, h: 0.7,
    fill: { color: 'E0F2FE' },
    line: { color: 'BAE6FD', width: 1 },
    rectRadius: 0.08
  });
  slide.addText('Core Concept: ข้อมูลทั้งหมดเชื่อมต่อเป็นสายใยเดียว (Traceability Thread) ไม่มีการสูญหายหรือตกหล่นระหว่างทาง', {
    x: 0.8, y: 6.25, w: 11.7, h: 0.4,
    fontFace: FONT_HEAD, fontSize: 13, bold: true, color: '0369A1', align: 'center',
    margin: 0
  });

  slide.addNotes(
    "สคริปต์พูดหน้านี้:\n" +
    "นี่คือภาพรวมของ SoftFlow ครับ เราเปลี่ยนจากการมองแยกส่วน เป็นการร้อยเรียง 7 ขั้นตอนให้เป็นเนื้อเดียวกัน\n" +
    "จุดเด่นคือ ทุกขั้นตอนจะอ้างอิงข้อมูลของขั้นตอนก่อนหน้าเสมอ เช่น Task ใน Step 5 จะต้องชี้กลับไปที่ Requirement ใน Step 2 เสมอครับ"
  );
}

// ==========================================
// SLIDE 7: Technical Stack & Architecture
// ==========================================
{
  const slide = pres.addSlide();
  slide.background = { color: C_LIGHT_BG };
  addSlideHeader(slide, 'Technology & Stack', 'สถาปัตยกรรมระบบและเทคโนโลยีที่เลือกใช้', 'การออกแบบระบบให้มีความเสถียร รองรับการขยายตัว และปลอดภัยระดับองค์กร');

  const stack = [
    {
      layer: 'Frontend Layer',
      tech: 'Angular 18 & Modern UI',
      details: [
        'Single Page Application (SPA) ทำงานรวดเร็ว',
        'Interactive Diagram Designer (วาด DFD / ER บนเว็บ)',
        'Responsive Kanban Board & Real-time UI updates',
        'Role-based Component Rendering'
      ]
    },
    {
      layer: 'Backend Layer',
      tech: 'Java 21 & Spring Boot 3',
      details: [
        'RESTful API Service พร้อม Spring Security',
        'Impact Analysis Engine สำหรับคำนวณผลกระทบ',
        'Automated SQL DDL Script Generator',
        'Clean Architecture แยก Business Logic ชัดเจน'
      ]
    },
    {
      layer: 'Data & Infrastructure',
      tech: 'Enterprise Infrastructure',
      details: [
        'PostgreSQL สำหรับจัดเก็บข้อมูลเชิงสัมพันธ์',
        'Keycloak SSO สำหรับ Authentication & RBAC',
        'SeaweedFS สำหรับจัดเก็บเอกสารและไฟล์แนบ',
        'Docker Containerized Deployment พร้อม e2e testing'
      ]
    }
  ];

  stack.forEach((st, idx) => {
    const x = 0.8 + idx * 3.9;
    slide.addShape(pres.ShapeType.roundRect, {
      x, y: 2.1, w: 3.7, h: 4.8,
      fill: { color: C_CARD_BG },
      line: { color: C_CARD_BORDER, width: 1 },
      rectRadius: 0.1
    });

    slide.addText(st.layer.toUpperCase(), {
      x: x + 0.3, y: 2.4, w: 3.1, h: 0.3,
      fontFace: FONT_HEAD, fontSize: 11, bold: true, color: C_ACCENT,
      margin: 0
    });

    slide.addText(st.tech, {
      x: x + 0.3, y: 2.8, w: 3.1, h: 0.5,
      fontFace: FONT_HEAD, fontSize: 16, bold: true, color: C_TEXT_MAIN,
      margin: 0
    });

    const bodyText = st.details.map(pt => ({ text: pt, options: { bullet: true, breakLine: true, fontSize: 12.5, color: C_TEXT_MUTED, fontFace: FONT_BODY, paraSpaceAfter: 12 } }));
    slide.addText(bodyText, {
      x: x + 0.3, y: 3.5, w: 3.1, h: 3.2,
      margin: 0
    });
  });

  slide.addNotes(
    "สคริปต์พูดหน้านี้:\n" +
    "ในส่วนของสถาปัตยกรรมทางเทคนิค เราเลือกใช้ Enterprise Standard:\n" +
    "Frontend ใช้ Angular เพื่อความเสถียรของแอปพลิเคชันขนาดใหญ่\n" +
    "Backend ใช้ Java Spring Boot ที่มีระบบ Transaction Management และ Impact Analysis Engine ในตัว\n" +
    "ส่วนระบบความปลอดภัยใช้ Keycloak จัดการ SSO และ Role-Based Access Control เพื่อให้พร้อมเชื่อมต่อระบบองค์กรครับ"
  );
}

// ==========================================
// SLIDE 8: System Overview & Grouped Modules
// ==========================================
{
  const slide = pres.addSlide();
  slide.background = { color: C_LIGHT_BG };
  addSlideHeader(slide, 'System Overview', 'ภาพรวมหน้าจอระบบและการจัดกลุ่มโมดูล (System Hierarchy)', 'จัดระเบียบโครงสร้างระบบออกเป็น 3 กลุ่มฟังก์ชันหลัก เพื่อให้ใช้งานง่ายและเห็นภาพรวม');

  const groups = [
    {
      group: 'กลุ่มที่ 1: การตั้งค่าและการจัดการองค์กร (System Admin)',
      items: [
        'จัดการข้อมูลลูกค้าและคู่สัญญา (Customer & Contract Management)',
        'จัดการทีมงาน โครงสร้าง และบทบาท (Team & Roles Configuration)',
        'กำหนดสิทธิ์การเข้าถึงเมนูและการอนุมัติ (RBAC & Approval Workflows)',
        'เชื่อมต่อโมเดล AI และบริการภายนอก (AI Configuration)'
      ]
    },
    {
      group: 'กลุ่มที่ 2: การบริหารและดำเนินโครงการ (Project Execution)',
      items: [
        'Requirement Management พร้อมระบบ Approval Gate ล็อกสเปก',
        'เครื่องมือวาด Diagram (DFD & ER) และแปลงเป็น SQL Generator',
        'ระบบวิเคราะห์ผลกระทบเมื่อเกิด Change Request (Impact Analysis)',
        'Sprint Planning & Interactive Kanban Board ติดตามสถานะงาน'
      ]
    },
    {
      group: 'กลุ่มที่ 3: การควบคุมคุณภาพและการส่งมอบ (QA & Delivery)',
      items: [
        'Test Case Management & AI Auto Test Case Generator',
        'Bug & Defect Tracking ผูกโยงกับ Task และผู้รับผิดชอบ',
        'Customer Portal สำหรับตรวจรับงานจริง (UAT Sign-off)',
        'Executive Dashboard สรุปความคืบหน้า งบประมาณ และ Manday'
      ]
    }
  ];

  groups.forEach((g, idx) => {
    const y = 2.1 + idx * 1.6;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y, w: 11.7, h: 1.45,
      fill: { color: C_CARD_BG },
      line: { color: C_CARD_BORDER, width: 1 },
      rectRadius: 0.08
    });

    slide.addText(g.group, {
      x: 1.1, y: y + 0.15, w: 11.0, h: 0.35,
      fontFace: FONT_HEAD, fontSize: 14, bold: true, color: C_PRIMARY,
      margin: 0
    });

    const bodyText = g.items.map(it => ({ text: it, options: { bullet: true, breakLine: true, fontSize: 12, color: C_TEXT_MAIN, fontFace: FONT_BODY, paraSpaceAfter: 4 } }));
    slide.addText(bodyText, {
      x: 1.1, y: y + 0.55, w: 11.0, h: 0.8,
      margin: 0
    });
  });

  slide.addNotes(
    "สคริปต์พูดหน้านี้ (แก้ปัญหาที่ผู้รีวิวแนะนำ ไม่ให้หลงในรายละเอียด):\n" +
    "ก่อนที่เราจะเจาะลึกในแต่ละโมดูล ผมขอจัดกลุ่มระบบออกเป็น 3 เสาหลักครับ:\n" +
    "กลุ่มแรกคือ System Admin จัดการข้อมูลตั้งต้นและสิทธิ์ผู้ใช้\n" +
    "กลุ่มที่สองคือ Project Execution หัวใจของการวิเคราะห์ ออกแบบ และพัฒนา\n" +
    "กลุ่มที่สามคือ QA & Delivery การทดสอบ ตรวจรับ และส่งมอบงานครับ"
  );
}

// ==========================================
// SLIDE 9: Module Deep-Dive 1 - Requirement & Impact Engine
// ==========================================
{
  const slide = pres.addSlide();
  slide.background = { color: C_LIGHT_BG };
  addSlideHeader(slide, 'Core Feature 01', 'ระบบจัดการ Requirement & Change Impact Engine', 'ล็อกสเปกให้ชัดเจน และประเมินผลกระทบต่อต้นทุนและเวลาทันทีเมื่อมีการขอแก้ไข');

  const feats = [
    {
      title: 'Approval Gate ล็อกสเปก',
      desc: 'Requirement ทุกข้อต้องผ่านการยืนยันร่วมกันระหว่าง BA และลูกค้าก่อนเข้าสู่ขั้นตอนพัฒนา ป้องกันปัญหาลูกค้าอ้างว่าไม่ได้ขอ'
    },
    {
      title: 'Change Request (CR) Workflow',
      desc: 'เมื่อลูกค้าขอเปลี่ยนความต้องการ ระบบบังคับเปิดคำขอ CR พร้อมคำนวณ Manday และค่าใช้จ่ายส่วนเพิ่มให้อัตโนมัติ'
    },
    {
      title: 'Real-time Impact Analysis',
      desc: 'เครื่องมือวิเคราะห์อัตโนมัติ ชี้เป้าทันทีว่าการเปลี่ยน Requirement ข้อนี้ จะกระทบตารางใน ER Diagram ไหน และกระทบ Task ใดในระบบ'
    }
  ];

  feats.forEach((f, idx) => {
    const x = 0.8 + idx * 3.9;
    slide.addShape(pres.ShapeType.roundRect, {
      x, y: 2.1, w: 3.7, h: 4.8,
      fill: { color: C_CARD_BG },
      line: { color: C_CARD_BORDER, width: 1 },
      rectRadius: 0.1
    });

    slide.addText(`ฟีเจอร์หลัก ${idx + 1}`, {
      x: x + 0.3, y: 2.4, w: 3.1, h: 0.3,
      fontFace: FONT_HEAD, fontSize: 11, bold: true, color: C_ACCENT,
      margin: 0
    });

    slide.addText(f.title, {
      x: x + 0.3, y: 2.8, w: 3.1, h: 0.6,
      fontFace: FONT_HEAD, fontSize: 16, bold: true, color: C_TEXT_MAIN,
      margin: 0
    });

    slide.addText(f.desc, {
      x: x + 0.3, y: 3.6, w: 3.1, h: 3.0,
      fontFace: FONT_BODY, fontSize: 13, color: C_TEXT_MUTED,
      margin: 0
    });
  });

  slide.addNotes(
    "สคริปต์พูดหน้านี้:\n" +
    "หัวใจแรกคือ Requirement Management และ Impact Engine ครับ\n" +
    "ไม่ใช่แค่การจดโน้ตสเปก แต่ระบบนี้มี Logic ตรวจสอบว่า เมื่อสเปกข้อหนึ่งถูกแก้ มันจะส่งผลกระทบลูกโซ่ไปที่ Database และ Task ไหนบ้าง\n" +
    "ทำให้ทีมงานตอบลูกค้าได้ทันทีว่า ถ้าจะแก้ส่วนนี้ จะต้องเพิ่มเวลากี่วัน และเพิ่มค่าใช้จ่ายเท่าไหร่ครับ"
  );
}

// ==========================================
// SLIDE 10: Module Deep-Dive 2 - Visual Analysis & Schema Generator
// ==========================================
{
  const slide = pres.addSlide();
  slide.background = { color: C_LIGHT_BG };
  addSlideHeader(slide, 'Core Feature 02', 'เครื่องมือวาด Diagram ในตัว & ตัวสร้างสคริปต์ฐานข้อมูล', 'ออกแบบ DFD และ ER Diagram บนเว็บได้โดยตรง พร้อมแปลงเป็น SQL DDL ในคลิกเดียว');

  const feats = [
    {
      title: 'DFD Design Module',
      desc: 'วาด Data Flow Diagram (Level 0-2) ได้โดยตรงบนเว็บ พร้อมเชื่อมโยง Process แต่ละตัวเข้ากับ Requirement โดยตรง ไม่ต้องพึ่งพาแอปพลิเคชันภายนอก'
    },
    {
      title: 'Interactive ER Diagram',
      desc: 'ออกแบบตารางฐานข้อมูล กำหนด Primary Key, Foreign Key และความสัมพันธ์ พร้อมระบบตรวจสอบความถูกต้องของโครงสร้างเชิงตรรกะ'
    },
    {
      title: 'One-Click SQL Generator',
      desc: 'แปลง ER Diagram ออกมาเป็น SQL Script ที่พร้อมนำไป Execute บนฐานข้อมูลจริง รองรับทั้ง PostgreSQL, MySQL และ SQL Server ช่วยลด Human Error ในการเขียนโค้ด'
    }
  ];

  feats.forEach((f, idx) => {
    const x = 0.8 + idx * 3.9;
    slide.addShape(pres.ShapeType.roundRect, {
      x, y: 2.1, w: 3.7, h: 4.8,
      fill: { color: C_CARD_BG },
      line: { color: C_CARD_BORDER, width: 1 },
      rectRadius: 0.1
    });

    slide.addText(`เครื่องมือ ${idx + 1}`, {
      x: x + 0.3, y: 2.4, w: 3.1, h: 0.3,
      fontFace: FONT_HEAD, fontSize: 11, bold: true, color: C_ACCENT,
      margin: 0
    });

    slide.addText(f.title, {
      x: x + 0.3, y: 2.8, w: 3.1, h: 0.6,
      fontFace: FONT_HEAD, fontSize: 16, bold: true, color: C_TEXT_MAIN,
      margin: 0
    });

    slide.addText(f.desc, {
      x: x + 0.3, y: 3.6, w: 3.1, h: 3.0,
      fontFace: FONT_BODY, fontSize: 13, color: C_TEXT_MUTED,
      margin: 0
    });
  });

  slide.addNotes(
    "สคริปต์พูดหน้านี้:\n" +
    "ในขั้นตอน System Analysis เรามี Built-in Diagram Tools ในระบบเลย ไม่ต้องสลับไปใช้ Draw.io หรือแอปนอก\n" +
    "ที่สำคัญคือเมื่อวาด ER เสร็จ เรามีระบบ SQL Generator กดปุ่มเดียวสร้าง DDL Script ได้เลย ทำให้สิ่งที่ออกแบบกับสิ่งที่ดีพลอยในฐานข้อมูลตรงกันเสมอครับ"
  );
}

// ==========================================
// SLIDE 11: Module Deep-Dive 3 - Task Tracking & Kanban
// ==========================================
{
  const slide = pres.addSlide();
  slide.background = { color: C_LIGHT_BG };
  addSlideHeader(slide, 'Core Feature 03', 'ระบบบริหารและติดตามงาน (Task & Kanban Engine)', 'เปลี่ยนข้อกำหนดเป็นชิ้นงานจริง ควบคุม Manday และเฝ้าระวัง Dependency Delay');

  const feats = [
    {
      title: 'Interactive Kanban Board',
      desc: 'บอร์ดจัดการงานแบบ Drag & Drop แยกสถานะชัดเจน (To Do, In Progress, In Review, Done) ช่วยให้ทุกคนในทีมเห็น Flow งานแบบ Real-time'
    },
    {
      title: 'Dependency & Delay Alert',
      desc: 'ระบบตรวจจับความเชื่อมโยงของงาน หาก Task ตั้งต้นเกิดความล่าช้า ระบบจะแจ้งเตือนผลกระทบต่อ Task ลูกข่ายและ Milestone ทันที'
    },
    {
      title: 'Manday vs Actual Tracking',
      desc: 'เปรียบเทียบระยะเวลาที่ประเมินไว้ (Estimated Manday) กับเวลาที่ใช้จริง เพื่อวัดความแม่นยำในการวางแผนและนำไปปรับปรุงโปรเจกต์ถัดไป'
    }
  ];

  feats.forEach((f, idx) => {
    const x = 0.8 + idx * 3.9;
    slide.addShape(pres.ShapeType.roundRect, {
      x, y: 2.1, w: 3.7, h: 4.8,
      fill: { color: C_CARD_BG },
      line: { color: C_CARD_BORDER, width: 1 },
      rectRadius: 0.1
    });

    slide.addText(`ความสามารถ ${idx + 1}`, {
      x: x + 0.3, y: 2.4, w: 3.1, h: 0.3,
      fontFace: FONT_HEAD, fontSize: 11, bold: true, color: C_ACCENT,
      margin: 0
    });

    slide.addText(f.title, {
      x: x + 0.3, y: 2.8, w: 3.1, h: 0.6,
      fontFace: FONT_HEAD, fontSize: 16, bold: true, color: C_TEXT_MAIN,
      margin: 0
    });

    slide.addText(f.desc, {
      x: x + 0.3, y: 3.6, w: 3.1, h: 3.0,
      fontFace: FONT_BODY, fontSize: 13, color: C_TEXT_MUTED,
      margin: 0
    });
  });

  slide.addNotes(
    "สคริปต์พูดหน้านี้:\n" +
    "ในส่วนของ Task Management เราไม่ได้ทำแค่บอร์ดการ์ดทั่วไป แต่มีการผูก Dependency Alert\n" +
    "ทำให้ PM รู้ทันทีว่าถ้างานส่วนไหนช้า จะส่งผลให้วันที่ส่งมอบเลื่อนออกไปกี่วัน เป็น Early Warning System ช่วยป้องกันวิกฤตครับ"
  );
}

// ==========================================
// SLIDE 12: Module Deep-Dive 4 - QA & AI Test Generation
// ==========================================
{
  const slide = pres.addSlide();
  slide.background = { color: C_LIGHT_BG };
  addSlideHeader(slide, 'Core Feature 04', 'การควบคุมคุณภาพ & ผู้ช่วย AI อัจฉริยะ (QA & AI Module)', 'ยกระดับความเชื่อมั่นในการส่งมอบ และเร่งความเร็วในการสร้าง Test Cases ด้วย AI');

  const feats = [
    {
      title: 'AI Auto Test Case Generator',
      desc: 'นำเทคโนโลยี Generative AI (Gemini Pro) มาช่วยอ่าน Requirement แล้วสร้าง Test Scenarios (Happy & Unhappy Cases) ให้ Tester ตรวจสอบและใช้งานได้ทันที'
    },
    {
      title: 'Bug & Defect Traceability',
      desc: 'เปิดและติดตาม Bug โดยผูกเข้ากับ Task และ Requirement ที่เกี่ยวข้อง พร้อมระบบ Retest Workflow บังคับแก้ไข Critical Bug ให้หมดก่อนส่งมอบ'
    },
    {
      title: 'Customer UAT Sign-off Portal',
      desc: 'พอร์ทัลตรวจรับงานสำหรับลูกค้าโดยเฉพาะ สามารถทดสอบและกดยืนยันผลการตรวจรับผ่านระบบแบบดิจิทัล พร้อมออกเอกสารรับรองอัตโนมัติ'
    }
  ];

  feats.forEach((f, idx) => {
    const x = 0.8 + idx * 3.9;
    slide.addShape(pres.ShapeType.roundRect, {
      x, y: 2.1, w: 3.7, h: 4.8,
      fill: { color: C_CARD_BG },
      line: { color: C_CARD_BORDER, width: 1 },
      rectRadius: 0.1
    });

    slide.addText(`นวัตกรรม ${idx + 1}`, {
      x: x + 0.3, y: 2.4, w: 3.1, h: 0.3,
      fontFace: FONT_HEAD, fontSize: 11, bold: true, color: C_EMERALD,
      margin: 0
    });

    slide.addText(f.title, {
      x: x + 0.3, y: 2.8, w: 3.1, h: 0.6,
      fontFace: FONT_HEAD, fontSize: 16, bold: true, color: C_TEXT_MAIN,
      margin: 0
    });

    slide.addText(f.desc, {
      x: x + 0.3, y: 3.6, w: 3.1, h: 3.0,
      fontFace: FONT_BODY, fontSize: 13, color: C_TEXT_MUTED,
      margin: 0
    });
  });

  slide.addNotes(
    "สคริปต์พูดหน้านี้:\n" +
    "ในส่วนของ QA เราผสาน AI เข้ามาช่วยวิเคราะห์ Spec เพื่อสร้าง Test Case ทั้งกรณีปกติและกรณีขอบเขต (Edge Cases)\n" +
    "ช่วยลดภาระของ QA ได้อย่างมีนัยสำคัญ และทำให้เรามี Gate ตรวจรับที่โปร่งใสทั้งสองฝ่ายครับ"
  );
}

// ==========================================
// SLIDE 13: Comparison Table (Before vs After)
// ==========================================
{
  const slide = pres.addSlide();
  slide.background = { color: C_LIGHT_BG };
  addSlideHeader(slide, 'Value Proposition', 'ตารางเปรียบเทียบ: การจัดการแบบเดิม vs SoftFlow Platform', 'ความแตกต่างอย่างชัดเจนในการบริหารจัดการโครงการซอฟต์แวร์ยุคใหม่');

  const rows = [
    [
      { text: 'มิติการประเมิน', options: { fontFace: FONT_HEAD, fontSize: 13, bold: true, color: C_WHITE, fill: { color: C_PRIMARY }, align: 'center' } },
      { text: 'การทำงานแบบเดิม (Traditional Process)', options: { fontFace: FONT_HEAD, fontSize: 13, bold: true, color: C_WHITE, fill: { color: '475569' }, align: 'center' } },
      { text: 'ระบบ SoftFlow (Our Platform)', options: { fontFace: FONT_HEAD, fontSize: 13, bold: true, color: C_WHITE, fill: { color: C_EMERALD }, align: 'center' } }
    ],
    [
      { text: 'การจัดการ Requirement', options: { fontFace: FONT_HEAD, fontSize: 12, bold: true, color: C_TEXT_MAIN } },
      { text: 'กระจัดกระจายในแชตและอีเมล เปลี่ยนแปลงโดยไม่มีการบันทึก', options: { fontFace: FONT_BODY, fontSize: 12, color: C_TEXT_MUTED } },
      { text: 'ศูนย์กลางข้อมูลเดียว พร้อมระบบ Sign-off และคุมการเปลี่ยนแปลง', options: { fontFace: FONT_BODY, fontSize: 12, color: C_TEXT_MAIN, bold: true } }
    ],
    [
      { text: 'ความสอดคล้องของเอกสาร & โค้ด', options: { fontFace: FONT_HEAD, fontSize: 12, bold: true, color: C_TEXT_MAIN } },
      { text: 'เอกสารกับโค้ดไม่ตรงกัน (Outdated Documentation)', options: { fontFace: FONT_BODY, fontSize: 12, color: C_TEXT_MUTED } },
      { text: 'เชื่อมโยง 100% Traceability ตั้งแต่ DFD/ER จนถึง Test Case', options: { fontFace: FONT_BODY, fontSize: 12, color: C_TEXT_MAIN, bold: true } }
    ],
    [
      { text: 'การประเมินผลกระทบ (CR Impact)', options: { fontFace: FONT_HEAD, fontSize: 12, bold: true, color: C_TEXT_MAIN } },
      { text: 'ใช้การคาดเดา มักมองข้ามผลกระทบต่อตารางฐานข้อมูลและเวลา', options: { fontFace: FONT_BODY, fontSize: 12, color: C_TEXT_MUTED } },
      { text: 'Impact Analysis Engine ประเมิน Schema และคำนวณ Manday ทันที', options: { fontFace: FONT_BODY, fontSize: 12, color: C_TEXT_MAIN, bold: true } }
    ],
    [
      { text: 'ความโปร่งใสและการส่งมอบ', options: { fontFace: FONT_HEAD, fontSize: 12, bold: true, color: C_TEXT_MAIN } },
      { text: 'ลูกค้าและผู้บริหารรอดูผลตอนจบ มักเกิดข้อพิพาทหน้างาน', options: { fontFace: FONT_BODY, fontSize: 12, color: C_TEXT_MUTED } },
      { text: 'แดชบอร์ดสุขภาพโครงการแบบ Real-time พร้อม UAT Gate ดิจิทัล', options: { fontFace: FONT_BODY, fontSize: 12, color: C_TEXT_MAIN, bold: true } }
    ]
  ];

  slide.addTable(rows, {
    x: 0.8, y: 2.1, w: 11.7, h: 4.6,
    border: { pt: 1, color: C_CARD_BORDER },
    autoPage: false
  });

  slide.addNotes(
    "สคริปต์พูดหน้านี้:\n" +
    "ตารางนี้สรุปความแตกต่างใน 4 มิติสำคัญครับ จะเห็นว่าแพลตฟอร์มนี้ไม่ได้เปลี่ยนแค่วิธีการทำงาน แต่เปลี่ยนให้กระบวนการทั้งหมดสามารถตรวจสอบและวัดผลได้จริง\n" +
    "ทำให้ทีมพัฒนาทำงานได้อย่างสบายใจ และผู้บริหารเห็นภาพรวมที่ถูกต้องครับ"
  );
}

// ==========================================
// SLIDE 14: Transition to Live Demonstration
// ==========================================
{
  const slide = pres.addSlide();
  slide.background = { color: C_DARK_BG };

  slide.addText('INTERACTIVE DEMONSTRATION', {
    x: 1.0, y: 1.5, w: 11.3, h: 0.4,
    fontFace: FONT_HEAD, fontSize: 13, bold: true, color: '38BDF8',
    margin: 0
  });

  slide.addText('การสาธิตการใช้งานระบบจริง (Live Demonstration)', {
    x: 1.0, y: 2.0, w: 11.3, h: 0.8,
    fontFace: FONT_HEAD, fontSize: 30, bold: true, color: C_WHITE,
    margin: 0
  });

  slide.addText('เจาะลึก 3 ไฮไลต์การทำงานจริงบนซอฟต์แวร์ (ระยะเวลาประมาณ 5-7 นาที)', {
    x: 1.0, y: 2.9, w: 11.3, h: 0.4,
    fontFace: FONT_BODY, fontSize: 16, color: '94A3B8',
    margin: 0
  });

  const demoItems = [
    {
      num: 'Demo 01',
      title: 'สร้าง Requirement & ทดสอบ Impact Analysis',
      desc: 'แสดงการจำลองการแก้ไขสเปก และดูระบบตรวจจับผลกระทบต่อ ER Diagram และ Task แบบ Real-time'
    },
    {
      num: 'Demo 02',
      title: 'วาด ER Diagram & สร้าง SQL DDL Script',
      desc: 'แสดงการออกแบบตารางข้อมูลบนเว็บ และกดปุ่มแปลงออกมาเป็น SQL Schema Script ที่พร้อมใช้งาน'
    },
    {
      num: 'Demo 03',
      title: 'สร้าง Test Cases อัตโนมัติด้วย AI Module',
      desc: 'แสดงการส่ง Requirement ให้ AI วิเคราะห์ และสร้าง Test Scenarios สำหรับนำไปใช้ในกระบวนการ QA'
    }
  ];

  demoItems.forEach((d, idx) => {
    const x = 1.0 + idx * 3.8;
    slide.addShape(pres.ShapeType.roundRect, {
      x, y: 3.6, w: 3.5, h: 3.0,
      fill: { color: C_NAVY },
      line: { color: '334155', width: 1 },
      rectRadius: 0.1
    });

    slide.addText(d.num, {
      x: x + 0.3, y: 3.9, w: 2.9, h: 0.3,
      fontFace: FONT_HEAD, fontSize: 12, bold: true, color: '38BDF8',
      margin: 0
    });

    slide.addText(d.title, {
      x: x + 0.3, y: 4.3, w: 2.9, h: 0.6,
      fontFace: FONT_HEAD, fontSize: 15, bold: true, color: C_WHITE,
      margin: 0
    });

    slide.addText(d.desc, {
      x: x + 0.3, y: 5.0, w: 2.9, h: 1.3,
      fontFace: FONT_BODY, fontSize: 12.5, color: 'CBD5E1',
      margin: 0
    });
  });

  slide.addNotes(
    "สคริปต์พูดหน้านี้ (จุดเปลี่ยนจากการเปิดสไลด์ 200 หน้ามาเป็นการสาธิตจริงตามคำแนะนำของพี่ๆ):\n" +
    "แทนที่เราจะเปิดสไลด์ดูทีละหน้าจอ ผมขอพาทุกท่านเข้าไปชมการทำงานจริงของระบบใน 3 ไฮไลต์สั้นๆ ดังนี้ครับ\n" +
    "1. การทำ Impact Analysis เมื่อสเปกเปลี่ยน\n" +
    "2. การวาด ER และ Gen SQL Script ในคลิกเดียว\n" +
    "3. และการใช้ AI ช่วยสร้าง Test Case ครับ... [สลับหน้าจอเข้าสู่แอปพลิเคชันจริง]"
  );
}

// ==========================================
// SLIDE 15: Future Roadmap & Next Steps
// ==========================================
{
  const slide = pres.addSlide();
  slide.background = { color: C_LIGHT_BG };
  addSlideHeader(slide, 'Project Roadmap', 'บทเรียนที่ได้รับและแผนการขยายผล (Next Steps)', 'การนำระบบไปปรับใช้จริงกับโครงการภายใน และแผนการพัฒนาต่อยอด');

  const roadmap = [
    {
      quarter: 'ระยะที่ 1 (ปัจจุบัน - พ.ย. 2026)',
      title: 'Internal Pilot Deployment',
      details: [
        'นำร่องทดลองใช้งานกับโครงการภายในบริษัท (Internal Projects)',
        'เก็บ Feedback จากทีมงาน SA, Dev และ QA จริง เพื่อนำมาขัดเกลา UI/UX',
        'ปรับจูนความแม่นยำของ AI Test Case Generation'
      ]
    },
    {
      quarter: 'ระยะที่ 2 (Q1 2027)',
      title: 'Git & CI/CD Integration',
      details: [
        'เชื่อมโยง Commit และ Pull Request เข้ากับ Task โดยอัตโนมัติ',
        'เพิ่มระบบแจ้งเตือนผ่าน Slack และ Microsoft Teams',
        'ขยายขีดความสามารถของ DFD Generator'
      ]
    },
    {
      quarter: 'ระยะที่ 3 (Q2 2027)',
      title: 'Enterprise Analytics & Report',
      details: [
        'ระบบคาดการณ์ความเสี่ยงโครงการด้วย Machine Learning (Risk Predictor)',
        'ออกรายงานสรุปสำหรับส่งมอบงานราชการและเอกชนตามมาตรฐานสากล',
        'เปิด API สำหรับเชื่อมต่อระบบบัญชีและ ERP ภายนอก'
      ]
    }
  ];

  roadmap.forEach((r, idx) => {
    const x = 0.8 + idx * 3.9;
    slide.addShape(pres.ShapeType.roundRect, {
      x, y: 2.1, w: 3.7, h: 4.8,
      fill: { color: C_CARD_BG },
      line: { color: C_CARD_BORDER, width: 1 },
      rectRadius: 0.1
    });

    slide.addText(r.quarter, {
      x: x + 0.3, y: 2.4, w: 3.1, h: 0.3,
      fontFace: FONT_HEAD, fontSize: 11, bold: true, color: C_ACCENT,
      margin: 0
    });

    slide.addText(r.title, {
      x: x + 0.3, y: 2.8, w: 3.1, h: 0.6,
      fontFace: FONT_HEAD, fontSize: 16, bold: true, color: C_TEXT_MAIN,
      margin: 0
    });

    const bodyText = r.details.map(pt => ({ text: pt, options: { bullet: true, breakLine: true, fontSize: 12.5, color: C_TEXT_MUTED, fontFace: FONT_BODY, paraSpaceAfter: 12 } }));
    slide.addText(bodyText, {
      x: x + 0.3, y: 3.6, w: 3.1, h: 3.0,
      margin: 0
    });
  });

  slide.addNotes(
    "สคริปต์พูดหน้านี้:\n" +
    "สำหรับก้าวต่อไป ตามที่พี่ๆ ได้ให้คำแนะนำไว้ เราจะนำแพลตฟอร์มนี้ไปทดสอบกับโปรเจกต์ภายในก่อน เพื่อเก็บข้อมูลการใช้งานจริง\n" +
    "และมีแผนจะเชื่อมต่อเข้ากับ Git และระบบ CI/CD เพื่อให้การติดตามโค้ดและเอกสารทำได้อย่างสมบูรณ์แบบ 100% ครับ"
  );
}

// ==========================================
// SLIDE 16: Conclusion & Q&A
// ==========================================
{
  const slide = pres.addSlide();
  slide.background = { color: C_DARK_BG };

  slide.addText('CONCLUSION & DISCUSSION', {
    x: 1.0, y: 1.8, w: 11.3, h: 0.4,
    fontFace: FONT_HEAD, fontSize: 13, bold: true, color: '38BDF8',
    margin: 0
  });

  slide.addText('ขอขอบพระคุณคณะกรรมการและพี่ๆ ทุกท่าน', {
    x: 1.0, y: 2.3, w: 11.3, h: 0.9,
    fontFace: FONT_HEAD, fontSize: 34, bold: true, color: C_WHITE,
    margin: 0
  });

  slide.addText('ยินดีรับฟังทุกคำแนะนำและข้อเสนอแนะเพื่อนำไปพัฒนาต่อยอดครับ', {
    x: 1.0, y: 3.3, w: 11.3, h: 0.5,
    fontFace: FONT_BODY, fontSize: 18, color: 'CBD5E1',
    margin: 0
  });

  // Contact / Info Box
  slide.addShape(pres.ShapeType.roundRect, {
    x: 1.0, y: 4.3, w: 8.5, h: 1.8,
    fill: { color: C_NAVY },
    line: { color: '334155', width: 1 },
    rectRadius: 0.1
  });

  slide.addText('นายภูรินทร์ สุขมั่น (ริน)', {
    x: 1.4, y: 4.6, w: 7.8, h: 0.4,
    fontFace: FONT_HEAD, fontSize: 18, bold: true, color: C_WHITE,
    margin: 0
  });

  slide.addText('สาขาวิทยาการคอมพิวเตอร์ คณะเทคโนโลยีสารสนเทศและการสื่อสาร มหาวิทยาลัยพะเยา\nSoftware Project Lifecycle Management & Tracking System\nRepository: sic-project', {
    x: 1.4, y: 5.1, w: 7.8, h: 0.8,
    fontFace: FONT_BODY, fontSize: 13, color: '94A3B8',
    margin: 0
  });

  slide.addNotes(
    "สคริปต์พูดหน้านี้:\n" +
    "ขอขอบพระคุณพี่ๆ และคณะกรรมการทุกท่านเป็นอย่างสูงครับสำหรับคำแนะนำที่มีค่ายิ่งในการพัฒนาระบบนี้\n" +
    "หากมีข้อสงสัยหรือข้อเสนอแนะเพิ่มเติมในส่วนใด ยินดีรับฟังและแลกเปลี่ยนครับ ขอบคุณครับ"
  );
}

// Generate the output file
const outputPath = path.resolve('สไลด์_Present_Project_Main_ฉบับปรับปรุงตามรีวิว.pptx');
pres.writeFile({ fileName: outputPath })
  .then(() => {
    console.log('SUCCESS: Generated deck at ' + outputPath);
  })
  .catch(err => {
    console.error('ERROR:', err);
    process.exit(1);
  });
