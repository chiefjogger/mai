// ————————————————————————————————————————————————————————————
// MAI BRAIN · bộ não chạy tại chỗ, không gọi mạng
//
// Mai không hỏi máy chủ nào cả. Câu của anh được gấp dấu, chấm điểm
// theo cụm từ, rồi ghép vào một ý định có sẵn kèm nút bấm thật.
// Không khớp thì vẫn có đường đi tiếp, không có ngõ cụt.
// ————————————————————————————————————————————————————————————

// ————— kho ý định · 5 mảng, gộp lại thành MAI_INTENTS —————

// pack: money
const PACK_MONEY = [
  {
    id: "pay_swim_open",
    k: ["hoc boi", "tien hoc boi", "hoc phi boi", "khoan thu boi", "vu hoc boi", "lop boi cua bin", "tien boi cua bin", "hoc boi cua bin"],
    must: ["boi"],
    not: ["da tra", "bien lai"],
    reply: "Học bơi tháng 8 của Bin 850.000đ, hạn 17:00 chiều nay. Cô Lan nhắc lần thứ hai, 14/32 phụ huynh đã đóng.",
    src: "Vy chuyển tiếp Zalo",
    flow: "pay",
    cta: "Trả ngay",
    chips: ["Học bơi bao nhiêu tiền?", "Trễ hạn thì sao?", "Ai đón Bin chiều nay?"],
  },
  {
    id: "pay_swim_amount",
    k: ["hoc boi bao nhieu", "bao nhieu tien hoc boi", "hoc phi boi bao nhieu", "tien boi bao nhieu", "gia hoc boi", "hoc boi het bao nhieu", "850",
        "hoc boi cua bin bao nhieu", "hoc phi cua bin bao nhieu"],
    must: ["boi", "850"],
    not: ["lich", "thu may", "hom nao"],
    w: 3,
    w: 2,
    reply: "850.000đ cho 8 buổi thứ Ba và thứ Năm, tính ra 106.250đ một buổi. Tháng 7 nhà mình đã trả đủ rồi.",
    src: "Vy chuyển tiếp Zalo",
    flow: "pay",
    cta: "Trả 850.000đ",
    chips: ["Trả học bơi luôn đi", "Số dư còn bao nhiêu?", "Trả bằng gì thì rẻ nhất?"],
  },
  {
    id: "pay_swim_now",
    k: ["tra hoc boi", "dong tien hoc boi", "tra tien boi", "thanh toan hoc boi", "dong hoc boi luon", "tra ngay hoc boi", "chuyen tien hoc boi", "dong tien cho co lan", "lo vu hoc boi di"],
    must: ["boi", "co lan"],
    not: ["chua", "bao nhieu"],
    w: 3,
    reply: "Mai mở sẵn khoản 850.000đ từ WinMoney, anh quét mặt là xong. Biên lai Mai gửi riêng cô Lan, không đăng vào nhóm 32 phụ huynh.",
    src: "Vy chuyển tiếp Zalo",
    flow: "pay",
    cta: "Trả ngay",
    action: { label: "Trả 850.000đ", amount: 850000 },
    chips: ["Biên lai gửi cho ai?", "Trả xong còn lại bao nhiêu?", "Ai đón Bin chiều nay?"],
  },
  {
    id: "pay_swim_deadline",
    k: ["han hoc boi", "han chot hoc boi", "hoc boi han khi nao", "khi nao phai dong tien boi", "may gio phai dong", "dong truoc may gio", "con bao lau nua"],
    must: ["han", "may gio", "bao lau", "khi nao"],
    w: 2,
    reply: "Hạn 17:00 chiều nay, còn 1 tiếng 18 phút. Cô Lan đã nhắc lần thứ hai từ sáng lúc 07:42.",
    src: "Zalo nhóm bơi 07:42",
    flow: "pay",
    cta: "Trả trước hạn",
    chips: ["Trễ hạn thì sao?", "Tuần này còn phải trả gì?", "Ai đón Bin chiều nay?"],
  },
  {
    id: "pay_swim_who_asks",
    k: ["ai doi tien", "ai nhac dong tien", "co nao nhac", "tin nay tu dau", "ai gui tin hoc boi", "ai bao dong tien", "co lan la ai"],
    must: ["ai", "co lan", "co nao", "tu dau"],
    w: 2,
    reply: "Cô Lan, giáo viên nhóm bơi của Bin, nhắn trong nhóm Zalo lúc 07:42 và Vy chuyển tiếp cho anh. Đây là lần nhắc thứ hai của cô.",
    src: "Vy chuyển tiếp Zalo",
    flow: "pay",
    cta: "Xem nguồn tin",
    chips: ["Bao nhiêu phụ huynh đã đóng?", "Trả học bơi luôn đi", "Ai đón Bin chiều nay?"],
  },
  {
    id: "pay_swim_progress",
    k: ["bao nhieu phu huynh da dong", "may nguoi dong roi", "phu huynh dong chua", "nha khac dong chua", "co bao nhieu nguoi dong", "14 32"],
    must: ["phu huynh", "nguoi dong", "nha khac", "32"],
    w: 2,
    reply: "14 trên 32 phụ huynh đã đóng, tính tới lúc cô Lan nhắn sáng nay. Nhà mình chưa có trong danh sách đó.",
    src: "Zalo nhóm bơi 07:42",
    flow: "pay",
    cta: "Đóng cho Bin",
    chips: ["Trễ hạn thì sao?", "Trả học bơi luôn đi", "Đã trả học bơi chưa?"],
  },
  {
    id: "pay_swim_late",
    k: ["tre han thi sao", "khong dong dung han", "quen dong thi sao", "dong tre co sao khong", "tra tre duoc khong", "de mai duoc khong", "bo qua duoc khong"],
    must: ["tre", "quen", "khong dong", "bo qua", "de mai"],
    w: 2,
    reply: "Không có phạt tiền, chỉ là cô Lan đọc tên nhà mình trong nhóm 32 phụ huynh ở lần nhắc thứ ba. Trả trước 17:00 là tránh được.",
    src: "Zalo nhóm bơi 07:42",
    flow: "pay",
    cta: "Trả trước 17:00",
    chips: ["Trả học bơi luôn đi", "Hạn học bơi khi nào?", "Tuần này còn phải trả gì?"],
  },
  {
    id: "pay_swim_status",
    k: ["da tra hoc boi chua", "dong tien boi chua", "hoc boi da tra chua", "thanh toan xong chua", "tra roi hay chua", "vu hoc boi xong chua", "hoc boi dong chua"],
    must: ["chua", "roi"],
    w: 3,
    reply: "Chưa anh. Khoản 850.000đ vẫn đang chờ, hạn 17:00 chiều nay.",
    src: "hồ sơ nhà mình",
    flow: "pay",
    cta: "Trả ngay",
    chips: ["Học phí quý 3 đóng chưa?", "Tiền điện tháng 7 sao rồi?", "Tuần này còn phải trả gì?"],
  },
  {
    id: "pay_swim_receipt",
    k: ["bien lai", "hoa don hoc boi", "co bien lai khong", "gui bien lai", "chung tu", "bien lai gui cho ai"],
    must: ["bien lai", "hoa don", "chung tu"],
    not: ["dien"],
    w: 2,
    reply: "Trả xong Mai gửi biên lai riêng cho cô Lan và lưu một bản vào hồ sơ của Bin, không đăng vào nhóm chung. Sang tháng Mai lấy ra đối chiếu.",
    src: "hồ sơ nhà mình",
    flow: "pay",
    cta: "Trả và nhận biên lai",
    chips: ["Trả bằng gì thì rẻ nhất?", "Liệt kê các khoản phải trả", "Học phí quý 3 đóng chưa?"],
  },
  {
    id: "pay_method",
    k: ["tra bang gi", "dung vi nao", "the hay vi", "chuyen khoan hay tien mat", "tra bang the co phi khong", "phi chuyen tien", "tra bang winmoney", "tra bang gi thi re nhat"],
    must: ["bang gi", "vi nao", "the", "phi chuyen", "chuyen khoan", "winmoney"],
    w: 2,
    reply: "WinMoney chuyển không mất phí, còn VISA ····8890 tính thêm 1.100đ. Mai để mặc định WinMoney vì số dư còn 2.480.000đ.",
    src: "ví WinMoney",
    flow: "pay",
    cta: "Chọn nguồn tiền",
    chips: ["Số dư còn bao nhiêu?", "Trả học bơi luôn đi", "Trả xong còn lại bao nhiêu?"],
  },
  {
    id: "form_trip_open",
    k: ["da ngoai", "can gio", "don da ngoai", "chuyen di cua na", "na di da ngoai", "truong na to chuc", "di choi cua na", "da ngoai can gio la gi"],
    must: ["da ngoai", "can gio", "cua na", "truong na"],
    reply: "Na đi dã ngoại Cần Giờ thứ Sáu 08/08, trường xin đơn đồng ý và 120.000đ trước hôm đó. Mai điền sẵn đơn rồi, chỉ chờ anh ký.",
    src: "email THCS Trần Phú",
    flow: "form",
    cta: "Xem đơn",
    chips: ["Phí dã ngoại bao nhiêu?", "Ký đơn cho Na luôn", "Trước cuối tuần còn gì?"],
  },
  {
    id: "form_trip_fee",
    k: ["phi da ngoai bao nhieu", "tien da ngoai", "da ngoai bao nhieu tien", "phi can gio", "120000", "120k"],
    must: ["da ngoai", "can gio", "120"],
    w: 2,
    reply: "120.000đ, nộp cùng đơn trước thứ Sáu 08/08. Mai chuyển luôn lúc anh ký thì có biên lai gửi cô Hồng, khỏi để Na cầm tiền mặt.",
    src: "email THCS Trần Phú",
    flow: "form",
    cta: "Ký và chuyển 120.000đ",
    chips: ["Ký đơn cho Na luôn", "Số dư còn bao nhiêu?", "Tuần này còn phải trả gì?"],
  },
  {
    id: "form_trip_sign",
    k: ["ky don", "ky giay cho na", "dien don cho na", "ky don da ngoai", "dong y cho na di", "ky giay to truong", "ky don cho na luon"],
    must: ["ky", "dien don", "dong y"],
    w: 3,
    reply: "Đơn Mai điền sẵn từ hồ sơ nhà mình, anh quét mặt là ký số bằng CCCD ···· 4102. Mai gửi thẳng cô Hồng chủ nhiệm 6A2 và lưu một bản.",
    src: "email THCS Trần Phú",
    flow: "form",
    cta: "Ký đơn",
    chips: ["Phí dã ngoại bao nhiêu?", "Dã ngoại Cần Giờ là gì?", "Trước cuối tuần còn gì?"],
  },
  {
    id: "form_trip_deadline",
    k: ["han nop don", "khi nao phai nop don", "don han khi nao", "han don da ngoai", "thu sau nop gi", "bao gio nop don"],
    must: ["don", "da ngoai", "nop"],
    w: 2,
    reply: "Trước thứ Sáu 08/08, tức còn hai ngày. Email trường gửi từ 03/08, Mai giữ lại chờ anh rảnh.",
    src: "email THCS Trần Phú",
    flow: "form",
    cta: "Ký đơn ngay",
    chips: ["Ký đơn cho Na luôn", "Trước cuối tuần còn gì?", "Tuần này còn phải trả gì?"],
  },
  {
    id: "money_balance",
    k: ["so du", "con bao nhieu tien", "vi con bao nhieu", "tai khoan con bao nhieu", "winmoney con bao nhieu", "so du con bao nhieu", "trong vi con bao nhieu",
        "vi con lai bao nhieu tien", "vi con lai bao nhieu", "con lai bao nhieu tien", "so du hien tai"],
    must: ["so du", "con bao nhieu", "vi", "winmoney", "tai khoan"],
    not: ["tra xong", "sau khi tra", "tru het", "tra het"],
    w: 2,
    reply: "WinMoney còn 2.480.000đ, nối với Techcombank ····4102. Đủ cho cả học bơi của Bin và phí dã ngoại của Na.",
    src: "ví WinMoney",
    chips: ["Trả học bơi luôn đi", "Trả xong còn lại bao nhiêu?", "Tuần này còn phải trả gì?"],
  },
  {
    id: "money_bank_link",
    k: ["techcombank", "ngan hang lien ket", "tai khoan ngan hang", "tcb", "nap tien vao vi", "lien ket the", "4102"],
    must: ["techcombank", "tcb", "ngan hang", "lien ket", "nap tien", "4102"],
    w: 2,
    reply: "Ví WinMoney nối thẳng Techcombank ····4102, chuyển qua lại không mất phí. Ví gần hết thì ví tự nạp thêm từ tài khoản đó, anh không phải làm gì.",
    src: "ví WinMoney",
    chips: ["Số dư còn bao nhiêu?", "Trả bằng gì thì rẻ nhất?", "Liệt kê các khoản phải trả"],
  },
  {
    id: "money_after_paying",
    k: ["tra xong con bao nhieu", "tra het thi con bao nhieu", "sau khi tra con bao nhieu", "tru het con bao nhieu", "tra xong con lai bao nhieu"],
    must: ["tra xong", "sau khi tra", "tru het", "tra het"],
    w: 3,
    reply: "Trả cả 850.000đ học bơi và 120.000đ dã ngoại thì ví còn 1.510.000đ. Vẫn dư cho giỗ Ông thứ Bảy.",
    src: "ví WinMoney",
    flow: "pay",
    cta: "Trả học bơi trước",
    chips: ["Giỗ Ông cần chuẩn bị gì?", "Tuần này còn phải trả gì?", "Số dư còn bao nhiêu?"],
  },
  {
    id: "tuition_q3_paid",
    k: ["hoc phi quy 3", "hoc phi truong", "hoc phi da dong chua", "tien hoc cua hai be", "hoc phi quy nay", "hoc phi quy 3 dong chua", "quy 3"],
    must: ["hoc phi", "tien hoc", "quy 3", "quy nay"],
    not: ["boi"],
    w: 2,
    reply: "Học phí quý 3 đã trả đủ ngày 02/07 qua WinMoney, Bin 4.200.000đ và Na 5.100.000đ. Quý 4 Mai nhắc anh ngày 25/09.",
    src: "hồ sơ nhà mình",
    files: true,
    cta: "Xem biên lai",
    chips: ["Tiền điện tháng 7 sao rồi?", "Liệt kê các khoản phải trả", "Tuần này còn phải trả gì?"],
  },
  {
    id: "bill_electric_july",
    k: ["tien dien", "dien thang 7", "hoa don dien", "dien bao nhieu", "tra tien dien chua", "dien thang nay", "tien dien thang 7 sao roi"],
    must: ["dien"],
    not: ["dien don"],
    w: 2,
    reply: "Điện tháng 7 đã trả 1.240.000đ, cao hơn tháng 6 khoảng 8% vì trời nóng. Kỳ tới Mai tự trả ngày 12/08, anh không cần nhớ.",
    src: "email EVN",
    files: true,
    cta: "Xem hoá đơn",
    chips: ["Học phí quý 3 đóng chưa?", "Liệt kê các khoản phải trả", "Số dư còn bao nhiêu?"],
  },
  {
    id: "owe_this_week",
    k: ["tuan nay no gi", "tuan nay phai tra gi", "tuan nay con phai tra gi", "con no gi", "phai dong gi", "con khoan nao chua tra", "tuan nay ton bao nhieu", "no ai cai gi",
        "toi no gi tuan nay", "no gi tuan nay", "con no bao nhieu",
        "bao nhieu tien tat ca", "het bao nhieu tien tat ca", "tat ca bao nhieu tien", "tong cong bao nhieu", "con phai tra gi", "phai tra gi tuan nay",
        "con phai dong gi", "tong cong phai tra bao nhieu", "tuan nay phai tra bao nhieu", "con khoan nao"],
    must: ["tuan nay", "no", "phai tra", "phai dong", "khoan nao", "khoan", "tat ca", "tong cong"],
    w: 2,
    reply: "Hai khoản, tổng 970.000đ: học bơi 850.000đ hạn 17:00 hôm nay và dã ngoại của Na 120.000đ hạn thứ Sáu. Ngoài hai cái đó tuần này không còn gì.",
    src: "hồ sơ nhà mình",
    flow: "pay",
    cta: "Trả khoản đến hạn hôm nay",
    chips: ["Ký đơn cho Na luôn", "Liệt kê các khoản phải trả", "Số dư còn bao nhiêu?"],
  },
  {
    id: "owe_breakdown",
    k: ["liet ke cac khoan", "chi tiet cac khoan phai tra", "bang ke", "tat ca khoan chua tra", "xem het cac khoan", "danh sach cac khoan", "tong hop chi tieu", "liet ke cac khoan phai tra"],
    must: ["liet ke", "chi tiet", "bang ke", "danh sach", "tat ca", "tong hop", "xem het"],
    w: 3,
    reply: "Đang mở: học bơi Bin 850.000đ hạn hôm nay, dã ngoại Na 120.000đ hạn thứ Sáu, đăng kiểm xe khoảng 340.000đ ngày 12/08. Đã xong: học phí quý 3 và điện tháng 7.",
    src: "hồ sơ nhà mình",
    files: true,
    cta: "Mở hồ sơ nhà mình",
    chips: ["Trả học bơi luôn đi", "Đăng kiểm xe khi nào?", "Số dư còn bao nhiêu?"],
  },
  {
    id: "owe_before_weekend",
    k: ["truoc cuoi tuan con gi", "cuoi tuan co phai tra gi khong", "con gi truoc thu bay", "cuoi tuan can chuan bi gi", "thu sau co gi", "sap toi co khoan nao"],
    must: ["cuoi tuan", "thu sau", "thu bay", "sap toi"],
    w: 2,
    reply: "Trước cuối tuần chỉ còn đơn và 120.000đ dã ngoại của Na, hạn thứ Sáu. Thứ Bảy là giỗ Ông, khoản đó Mai để riêng chưa tính vào đây.",
    src: "hồ sơ nhà mình",
    flow: "form",
    cta: "Ký đơn cho Na",
    chips: ["Giỗ Ông cần chuẩn bị gì?", "Tuần này còn phải trả gì?", "Phí dã ngoại bao nhiêu?"],
  },
  {
    id: "spend_today",
    k: ["hom nay tieu bao nhieu", "tong chi hom nay", "hom nay tieu het bao nhieu", "chi tieu hom nay", "hom nay da tra gi chua", "hom nay chi bao nhieu"],
    must: ["hom nay"],
    not: ["boi", "da ngoai", "dien"],
    w: 2,
    reply: "Tính tới 15:42 hôm nay nhà mình chưa chi đồng nào. Trả học bơi xong thì con số trong ngày là 850.000đ.",
    src: "ví WinMoney",
    flow: "pay",
    cta: "Trả 850.000đ",
    chips: ["Tuần này còn phải trả gì?", "Số dư còn bao nhiêu?", "Tối nay ăn gì?"],
  },
];

// pack: kids
const PACK_KIDS = [
  // ————— đón Bin 16:30 —————
  {
    id: "pickup_who",
    k: ["ai don bin", "ai don con", "ai di don bin", "don bin", "nguoi don bin", "chieu nay ai don", "ai ruoc bin", "don con chieu nay", "chua ai don bin"],
    must: ["don", "ruoc"],
    not: ["hoc phi", "dang kiem"],
    reply: "Chưa ai chốt đón Bin lúc 16:30, còn 48 phút nữa. Vy nhắn 15:38 là em đón được, nhưng chưa vào lịch của ai cả.",
    src: "lịch anh và Vy",
    flow: "pickup",
    cta: "Chốt người đón",
    chips: ["Vy nhắn gì lúc 15:38?", "Học bơi của Bin bao nhiêu?", "Hôm nay có gì?"],
  },
  {
    id: "pickup_when",
    k: ["may gio don bin", "don bin luc may gio", "bin tan hoc luc may gio", "bin tan boi luc may gio", "con bao nhieu phut", "con bao lau nua den gio don", "16 30", "16 30"],
    must: ["gio", "phut", "lau", "16"],
    reply: "Bin tan lớp bơi 16:30, cổng sau TH Lê Lợi, còn 48 phút nữa. Họp của anh kéo tới 17:00 nên chốt sớm cho chắc.",
    src: "lịch của Bin",
    flow: "pickup",
    cta: "Chốt giờ đón",
    chips: ["Ai đón Bin chiều nay?", "Bin học bơi hôm nào?", "Hôm nay có gì?"],
  },
  {
    id: "pickup_confirm",
    k: ["chot nguoi don", "chot di", "xac nhan don bin", "de vy don", "chot vy don bin", "dong y de vy don", "ok chot", "chot luon di", "vy don di"],
    must: ["chot", "xac nhan", "dong y", "ok"],
    w: 2,
    reply: "Vâng anh. Mai mở ra để anh chọn người và giờ, xong Mai báo Vy với cô Hạnh rồi ghi vào lịch cả hai.",
    flow: "pickup",
    cta: "Chốt ngay",
    chips: ["Nhắc tôi đón Bin", "Vy nhắn gì lúc 15:38?", "Trả học bơi ngay"],
  },
  {
    id: "pickup_clash_meeting",
    k: ["hop den 17h", "toi dang hop", "hop toi 5h", "dung lich", "bi trung lich", "hop khach hang", "toi ket hop", "hop den may gio", "toi khong di don duoc"],
    must: ["hop", "trung lich", "dung lich", "khong di don duoc"],
    reply: "Họp khách Q7 của anh 16:00 tới 17:00, mà Bin tan bơi 16:30. Anh không kịp đâu, để Mai chốt Vy hoặc cô Hạnh.",
    src: "lịch của anh",
    flow: "pickup",
    cta: "Xem ai đón được",
    chips: ["Vy nhắn gì lúc 15:38?", "Ai đón Bin chiều nay?", "Hôm nay có gì?"],
  },
  {
    id: "pickup_remind",
    k: ["nhac toi don bin", "nhac don bin", "dat nhac don bin", "nhac truoc 15 phut", "nhac toi luc 16 15", "nhac gio don bin"],
    must: ["nhac"],
    w: 2,
    reply: "Mai đặt nhắc trước 15 phút cho cả anh và Vy được, nhưng phải biết ai đi đón đã. Anh chốt người là Mai đặt luôn.",
    flow: "pickup",
    cta: "Chốt rồi đặt nhắc",
    chips: ["Ai đón Bin chiều nay?", "Nhắc tôi", "Hôm nay có gì?"],
  },
  {
    id: "bin_where_now",
    k: ["bin dang o dau", "bin dang lam gi", "gio nay bin o dau", "bin con o truong khong", "bin tan chua", "bin ve chua"],
    must: ["bin"],
    w: 2,
    reply: "Bin đang ở lớp bơi, 16:30 mới tan, điểm đón là cổng sau TH Lê Lợi. Chưa ai chốt đi đón bé.",
    src: "lịch của Bin",
    flow: "pickup",
    cta: "Chốt người đón",
    chips: ["Bin học bơi hôm nào?", "Vy đang làm gì?", "Bin học lớp mấy?"],
  },

  // ————— Vy —————
  {
    id: "vy_message",
    k: ["vy nhan gi", "vy noi gi", "tin nhan cua vy", "vy nhan luc may gio", "vo toi nhan gi", "vy co nhan khong", "vy nhan hoi nay"],
    must: ["vy", "vo"],
    not: ["dang lam gi", "o dau"],
    reply: "Vy nhắn lúc 15:38 trong Nhà mình: em đón được, anh họp đi. Mai chưa ghi vào lịch vì anh chưa xác nhận.",
    src: "Vy · Nhà mình 15:38",
    flow: "pickup",
    cta: "Xác nhận Vy đón",
    chips: ["Ai đón Bin chiều nay?", "Vy đang làm gì?", "Chốt người đón"],
  },
  {
    id: "vy_doing",
    k: ["vy dang lam gi", "vy o dau", "vo toi dang o dau", "vy ban khong", "gio nay vy lam gi", "vy the nao"],
    must: ["vy", "vo"],
    reply: "Vy nhắn 15:38 là em lo vụ đón Bin, và đã xem tin của anh lúc 15:39. Mai không theo vị trí của Vy, anh muốn Mai nhắn hỏi không?",
    src: "Nhà mình",
    goto: "family",
    cta: "Mở Nhà mình",
    chips: ["Vy nhắn gì lúc 15:38?", "Ai đón Bin chiều nay?", "Hôm nay có gì?"],
  },

  // ————— lớp bơi —————
  {
    id: "swim_schedule",
    k: ["bin hoc boi hom nao", "lich boi cua bin", "bin boi thu may", "lich hoc boi", "bin hoc boi luc may gio", "boi thu may", "lich boi",
        "lich hoc boi cua bin", "hoc boi cua bin thu may", "hoc boi cua bin the nao", "hoc boi hom nao"],
    w: 2,
    must: ["boi"],
    not: ["bao nhieu", "hoc phi", "dong tien", "tra tien"],
    reply: "Bin học bơi thứ Ba và thứ Năm, 16:30, lớp cơ bản nhóm 6 bé. Tháng 8 có 8 buổi.",
    src: "hồ sơ của Bin",
    chips: ["Buổi bơi tới là khi nào?", "Học bơi của Bin bao nhiêu?", "Ai đón Bin chiều nay?"],
  },
  {
    id: "swim_next_session",
    k: ["buoi boi tiep theo", "tuan sau boi luc nao", "buoi boi toi", "boi hom nao nua", "lan boi ke tiep", "tuan sau con boi khong", "buoi boi sap toi"],
    must: ["boi"],
    w: 2,
    reply: "Buổi tới là chiều mai thứ Năm, đã dời sang 17:00 vì lớp 3A nghỉ. Tuần sau về lại bình thường, thứ Ba và thứ Năm 16:30.",
    src: "Vy chuyển tiếp · nhóm 3A",
    chips: ["Chiều mai lớp có nghỉ không?", "Bin học bơi hôm nào?", "Học bơi của Bin bao nhiêu?"],
  },
  {
    id: "swim_class_cancel",
    k: ["mai co nghi hoc khong", "lop nghi", "chieu mai nghi", "co lan nhan gi", "thu nam nghi hoc", "lop 3a nghi", "nghi hoc chieu mai", "giao vien hop", "co nghi buoi nao khong"],
    must: ["nghi", "co lan", "giao vien"],
    reply: "Chiều mai lớp 3A nghỉ vì giáo viên họp, cô Lan báo lúc 15:44. Mai đã dời buổi bơi thứ Năm sang 17:00 và báo Vy rồi.",
    src: "Zalo · Vy chuyển tiếp",
    goto: "family",
    cta: "Xem trong Nhà mình",
    chips: ["Buổi bơi tới là khi nào?", "Ngày mai có gì?", "Ai đón Bin chiều nay?"],
  },

  // ————— Na —————
  {
    id: "na_parent_meeting",
    k: ["hop phu huynh khi nao", "hop phu huynh na", "hop phu huynh", "khi nao hop phu huynh", "hop phu huynh luc may gio", "hop phu huynh o dau", "15 08", "ngay 15 08"],
    must: ["phu huynh", "15 08"],
    not: ["bin"],
    reply: "Họp phụ huynh của Na lúc 19:00 thứ Sáu 15/08, phòng A2, cô Hồng chủ nhiệm 6A2. Đã vào lịch anh và Vy, nhắc trước một ngày.",
    src: "ảnh giấy báo của Na",
    chips: ["Na học lớp mấy?", "Đơn dã ngoại của Na ký chưa?", "Tuần này có gì?"],
  },
  {
    id: "na_class",
    k: ["na hoc lop may", "na may tuoi", "na lop may", "na hoc truong nao", "na hoc o dau", "con gai hoc lop may"],
    must: ["na", "con gai"],
    not: ["da ngoai", "hop phu huynh", "can gio"],
    reply: "Na lớp 6A2 trường THCS Trần Phú, 12 tuổi, cô Hồng chủ nhiệm. Hộ chiếu của bé còn hạn tới 03/2027.",
    src: "hồ sơ của Na",
    files: true,
    cta: "Mở hồ sơ Na",
    chips: ["Họp phụ huynh Na khi nào?", "Đơn dã ngoại của Na ký chưa?", "Bin học lớp mấy?"],
  },
  {
    id: "bin_class",
    k: ["bin hoc lop may", "bin may tuoi", "bin lop may", "bin hoc truong nao", "bin hoc o dau", "con trai hoc lop may"],
    must: ["bin", "con trai"],
    not: ["boi", "don bin", "dang o dau"],
    reply: "Bin đang lớp 3 trường TH Lê Lợi, 9 tuổi. Chiều nay bé có lớp bơi tới 16:30.",
    src: "hồ sơ của Bin",
    chips: ["Ai đón Bin chiều nay?", "Bin học bơi hôm nào?", "Na học lớp mấy?"],
  },
  {
    id: "kids_schools",
    k: ["hai be hoc truong nao", "con hoc truong nao", "truong cua hai be", "bin va na hoc truong gi", "hoc truong nao", "hai dua hoc truong gi"],
    must: ["truong"],
    not: ["hop phu huynh", "da ngoai"],
    reply: "Bin lớp 3 trường TH Lê Lợi, Na lớp 6A2 trường THCS Trần Phú. Học phí quý 3 của hai bé đã trả xong đầu tháng 7.",
    src: "hồ sơ hai bé",
    files: true,
    cta: "Mở hồ sơ hai bé",
    chips: ["Bin học lớp mấy?", "Na học lớp mấy?", "Giấy tờ của con đâu?"],
  },
  {
    id: "kids_files",
    k: ["giay to cua con", "ho so hai be", "giay to hai be", "so tiem chung", "ho chieu na", "giay to cua na", "ho so cua bin", "giay to con dau"],
    must: ["giay to", "ho so", "tiem chung", "ho chieu"],
    reply: "Hồ sơ hai bé có hộ chiếu Na hạn 03/2027, sổ tiêm chủng đủ mũi, học phí quý 3 đã trả đủ. Mai mở cho anh xem.",
    src: "hồ sơ nhà mình",
    files: true,
    cta: "Mở hồ sơ nhà mình",
    chips: ["Hai bé học trường nào?", "Họp phụ huynh Na khi nào?", "Hạn đăng kiểm xe?"],
  },

  // ————— giỗ Ông & quà cho Bà —————
  {
    id: "gio_ong",
    k: ["gio ong hom nao", "gio ong", "cuoi tuan co gi", "thu bay co gi", "gio ong may gio", "nha co gio khong", "gio ong o dau"],
    must: ["gio ong", "cuoi tuan", "thu bay"],
    reply: "Giỗ Ông thứ Bảy 09/08 ở nhà Ông Bà, Bà đã nhắn cả nhà về ăn giỗ. Cô Út đặt xe rồi.",
    src: "Ông bà & cô chú",
    goto: "ongba",
    cta: "Mở nhóm Ông bà",
    chips: ["Mua quà gì cho Bà?", "Tuần này có gì?", "Thứ Sáu tối tôi rảnh không?"],
  },

  // ————— lịch nhà —————
  {
    id: "today_agenda",
    k: ["hom nay co gi", "lich hom nay", "hom nay lam gi", "con viec gi hom nay", "hom nay con gi", "viec hom nay", "chieu nay co gi", "hom nay the nao"],
    must: ["hom nay", "chieu nay"],
    not: ["ai don", "don bin"],
    reply: "Trước 17:00 còn hai việc: học bơi 850.000đ của Bin và chốt người đón Bin lúc 16:30. Tối 20:00 có tập cuối Anh Trai Say Hi.",
    src: "Nhà mình · hôm nay",
    goto: "family",
    cta: "Mở việc hôm nay",
    chips: ["Ai đón Bin chiều nay?", "Trả học bơi ngay", "Tối nay nhà mình xem gì?"],
  },
  {
    id: "tomorrow_agenda",
    k: ["ngay mai co gi", "mai co gi", "lich ngay mai", "mai lam gi", "thu nam co gi", "ngay mai the nao", "mai ban gi khong"],
    must: ["ngay mai", "thu nam", "mai co gi", "mai lam gi", "mai ban gi"],
    reply: "Thứ Năm chiều lớp 3A nghỉ nên buổi bơi dời sang 17:00, Mai đã báo Vy. Tối thứ Năm Mai nhắc anh soạn balo cho Na đi Cần Giờ.",
    src: "lịch nhà mình",
    chips: ["Chiều mai lớp có nghỉ không?", "Đơn dã ngoại của Na ký chưa?", "Tuần này có gì?"],
  },
  {
    id: "week_agenda",
    k: ["tuan nay co gi", "lich tuan nay", "tuan nay ban gi", "con gi trong tuan", "lich ca tuan", "tuan nay the nao", "trong tuan co gi"],
    must: ["tuan"],
    not: ["tuan sau", "tuan truoc"],
    reply: "Thứ Năm Bin bơi 17:00, thứ Sáu Na đi Cần Giờ và 20:00 mở bán vé đợt 3, thứ Bảy giỗ Ông. Họp phụ huynh Na thì 15/08.",
    src: "lịch nhà mình",
    chips: ["Thứ Sáu tối tôi rảnh không?", "Giỗ Ông hôm nào?", "Đơn dã ngoại của Na ký chưa?"],
  },
  {
    id: "friday_evening_free",
    k: ["thu sau toi ranh khong", "toi thu sau co gi", "thu sau toi ban khong", "toi ranh thu sau khong", "thu sau co gi", "toi thu sau ranh", "toi thu sau the nao",
        "thu sau toi toi ranh khong", "thu sau toi co gi", "ranh thu sau", "thu sau ranh khong", "toi ranh khong", "co ranh toi thu sau"],
    must: ["thu sau"],
    reply: "Tối thứ Sáu lịch anh trống, chỉ có 20:00 mở bán vé đợt 3 Anh Trai Say Hi. Mai canh giùm để anh khỏi ngồi bấm.",
    src: "lịch của anh",
    flow: "ticket",
    cta: "Để Mai canh vé",
    chips: ["Vé concert đợt 3 khi nào?", "Tuần này có gì?", "Đơn dã ngoại của Na ký chưa?"],
  },
  {
    id: "remind_generic",
    k: ["nhac toi", "dat nhac nho", "nho nhac toi", "nhac gium toi", "tao nhac nho", "nhac toi viec nay", "dat lich nhac", "nhac lich hoc them", "nhac lich hoc"],
    must: ["nhac"],
    not: ["don bin", "dang kiem", "hoc boi", "ve concert"],
    reply: "Anh cho Mai giờ với việc, Mai đặt nhắc cho cả anh và Vy. Hôm nay Mai đang giữ hai mốc rồi: hạn học bơi 17:00 và đón Bin 16:30.",
    src: "nhắc của nhà mình",
    chips: ["Nhắc tôi đón Bin", "Hôm nay có gì?", "Tuần này có gì?"],
  },
];

// pack: docs
// Giấy tờ · xe · an toàn. Mọi câu trả lời dẫn tới một nút bấm nếu có luồng.
const PACK_DOCS = [
  // ————— ĐĂNG KIỂM · rộng → cụ thể —————
  {
    id: "dangkiem_when",
    k: ["khi nao dang kiem", "dang kiem khi nao", "han dang kiem", "dang kiem con bao nhieu ngay",
        "xe het han chua", "xe con han khong", "dang kiem xe", "con may ngay nua dang kiem",
        "dang kiem het han", "xe sap het han"],
    not: ["bao hiem", "tnds"],
    reply: "Đăng kiểm xe 51K-238.19 hết hạn 12/09, còn 37 ngày. Mai giữ được 07:30 sáng thứ Ba 12/08, khung vắng nhất trong tuần.",
    src: "hồ sơ xe",
    flow: "inspect",
    cta: "Đặt lịch đăng kiểm",
    chips: ["Quá hạn đăng kiểm phạt bao nhiêu?", "Đi trung tâm nào cho nhanh?", "Đăng kiểm cần mang giấy gì?"]
  },
  {
    id: "dangkiem_book",
    k: ["dat lich dang kiem", "dat dang kiem", "dang kiem di", "lo dang kiem di", "dang kiem luon",
        "dat lich cho xe", "dang ky lich dang kiem", "book dang kiem", "cho anh dat dang kiem"],
    w: 2,
    reply: "Mai đặt 07:30 thứ Ba 12/08 ở trung tâm 50-07V Bình Thạnh, xong trước cuộc họp 10:00 của anh.",
    src: "lịch của anh",
    flow: "inspect",
    cta: "Đặt lịch",
    chips: ["Đăng kiểm cần mang giấy gì?", "Phí đăng kiểm bao nhiêu?", "Sao lại đi sáng thứ Ba?"]
  },
  {
    id: "dangkiem_fine",
    k: ["qua han dang kiem", "dang kiem tre bi phat", "phat dang kiem bao nhieu", "phat dang kiem",
        "khong dang kiem co sao khong", "tre han dang kiem", "de qua han thi sao", "phat 6 trieu"],
    must: ["phat", "han", "sao"],
    reply: "Quá hạn đăng kiểm phạt từ 4 tới 6.000.000đ, và bảo hiểm có quyền từ chối bồi thường nếu xảy ra chuyện. Còn 37 ngày, anh đặt sớm cho chắc.",
    src: "hồ sơ xe",
    flow: "inspect",
    cta: "Đặt lịch ngay",
    chips: ["Khi nào xe hết hạn đăng kiểm?", "Đi trung tâm nào cho nhanh?", "Bảo hiểm xe còn hạn không?"]
  },
  {
    id: "dangkiem_center",
    k: ["trung tam dang kiem", "dang kiem o dau", "di dau dang kiem", "trung tam nao", "50 07v",
        "dang kiem cho nao gan", "trung tam nao nhanh", "trung tam nao vang"],
    reply: "Mai chọn 50-07V Bình Thạnh, 4,2km, chờ khoảng 20 phút. 50-05S Quận 7 gần chỗ làm hơn nhưng anh Khoa nói chờ hơn một tiếng.",
    src: "kênh Vietnam Cars",
    flow: "inspect",
    cta: "Chọn trung tâm",
    chips: ["Sao lại đi sáng thứ Ba?", "Đăng kiểm cần mang giấy gì?", "Đăng kiểm mất bao lâu?"]
  },
  {
    id: "dangkiem_tuesday",
    k: ["sao lai sang thu ba", "thu ba vang nhat", "gio nao vang", "di luc may gio dang kiem",
        "sang thu ba", "khi nao it nguoi", "tranh dong", "luc nao dang kiem it xe"],
    reply: "Anh Tuấn bên kênh Vietnam Cars đo rồi: sáng thứ Ba vắng nhất, tới trước 07:30 là 20 phút xong. Tránh cuối tháng vì xe tải dồn về.",
    src: "kênh Vietnam Cars",
    goto: "cars",
    cta: "Đọc bài anh Tuấn",
    chips: ["Đặt lịch đăng kiểm giúp anh", "Đi trung tâm nào cho nhanh?", "Đăng kiểm mất bao lâu?"]
  },
  {
    id: "dangkiem_papers",
    k: ["dang kiem can mang gi", "mang giay to gi", "can giay to gi khi dang kiem", "chuan bi gi dang kiem",
        "mang gi di dang kiem", "giay to dang kiem", "can nhung gi de dang kiem",
        "dang kiem can mang giay gi", "can mang giay gi", "mang giay gi", "can giay to gi",
        "mang gi khi dang kiem", "chuan bi giay to gi", "ho so dang kiem"],
    must: ["mang", "giay", "chuan", "ho so"],
    w: 2,
    reply: "Đăng ký xe, bảo hiểm TNDS còn hạn tới 03/2027 và CCCD, cả ba đều nằm sẵn trong hồ sơ nhà mình. Anh nhớ cầm khoảng 340.000đ tiền mặt, trung tâm này chưa nhận chuyển khoản.",
    src: "hồ sơ nhà mình",
    flow: "inspect",
    cta: "Xem danh sách mang theo",
    chips: ["Phí đăng kiểm bao nhiêu?", "Giấy tờ nhà mình để ở đâu?", "Bảo hiểm xe còn hạn không?"]
  },
  {
    id: "dangkiem_fee",
    k: ["phi dang kiem", "dang kiem bao nhieu tien", "gia dang kiem", "tien dang kiem",
        "dang kiem het bao nhieu", "chi phi dang kiem", "dang kiem ton bao nhieu"],
    must: ["phi", "tien", "gia", "nhieu", "chi"],
    reply: "Khoảng 340.000đ, trả tiền mặt ngay tại trung tâm. Khoản này trả cho trung tâm đăng kiểm nên không cộng điểm WinX, Mai vẫn lo giúp anh.",
    src: "hồ sơ xe",
    flow: "inspect",
    cta: "Đặt lịch",
    chips: ["Đăng kiểm cần mang giấy gì?", "Số dư WinMoney còn bao nhiêu?", "Khi nào xe hết hạn đăng kiểm?"]
  },
  {
    id: "dangkiem_howlong",
    k: ["dang kiem bao lau", "dang kiem mat bao lau", "cho bao lau", "dang kiem nhanh khong",
        "bao lau thi xong", "mat may tieng", "co lau khong"],
    must: ["lau", "nhanh", "tieng"],
    reply: "Đi 07:30 thứ Ba thì khoảng 20 phút là xong, chú Bình tuần trước vào 7:20 ra 7:45. Anh vẫn kịp cuộc họp 10:00.",
    src: "kênh Vietnam Cars",
    flow: "inspect",
    cta: "Đặt 07:30 thứ Ba",
    chips: ["Sao lại đi sáng thứ Ba?", "Đăng kiểm cần mang giấy gì?", "Đi trung tâm nào cho nhanh?"]
  },

  // ————— XE · hồ sơ, bảo hiểm, đăng ký —————
  {
    id: "car_info",
    k: ["xe cua anh", "bien so xe", "xe gi", "thong tin xe", "ho so xe", "xe nha minh",
        "51k", "xe doi nao", "xe minh la xe gi"],
    reply: "Mazda CX-5 đời 2021, biển 51K-238.19, đăng kiểm lần trước 12/09/2025 tại 50-07V, chu kỳ 12 tháng. Hạn tới là 12/09 năm nay.",
    src: "hồ sơ xe",
    files: true,
    cta: "Mở hồ sơ xe",
    chips: ["Bảo hiểm xe còn hạn không?", "Đặt lịch đăng kiểm giúp anh", "Giấy tờ nhà mình để ở đâu?"]
  },
  {
    id: "bao_hiem_xe",
    k: ["bao hiem xe", "bao hiem tnds", "bao hiem o to", "bao hiem con han khong",
        "bao hiem het han khi nao", "tnds", "bao hiem trach nhiem dan su",
        "bao hiem xe con han khong", "bao hiem con han", "bao hiem xe het han chua"],
    must: ["hiem", "tnds"],
    w: 3,
    reply: "Bảo hiểm TNDS của xe còn hạn tới 03/2027, mang đi đăng kiểm được luôn. Chị Hà trong kênh nhắc đúng chỗ này, thiếu tờ đó là bị trả về.",
    src: "hồ sơ xe",
    flow: "inspect",
    cta: "Đặt lịch đăng kiểm",
    chips: ["Đăng kiểm cần mang giấy gì?", "Giấy tờ nhà mình để ở đâu?", "Quá hạn đăng kiểm phạt bao nhiêu?"]
  },
  {
    id: "dang_ky_xe",
    k: ["giay dang ky xe", "ca vet", "cavet", "cavet xe", "dang ky xe o dau",
        "giay to xe", "ban sao dang ky xe", "giay xe de dau"],
    not: ["dang kiem"],
    reply: "Ảnh đăng ký xe nằm trong Hồ sơ nhà mình, mục Đăng kiểm ô tô, Mai đọc từ bản anh chụp 09/2025. Anh cần bản nào Mai gửi ngay, khỏi lục ngăn kéo.",
    src: "hồ sơ nhà mình",
    files: true,
    cta: "Mở hồ sơ",
    chips: ["Bảo hiểm xe còn hạn không?", "Đăng kiểm cần mang giấy gì?", "Mở két giấy tờ cho anh xem"]
  },

  // ————— HỘ CHIẾU · TIÊM CHỦNG —————
  {
    id: "passport_na",
    k: ["ho chieu na", "ho chieu con", "passport na", "ho chieu het han khi nao",
        "ho chieu con han khong", "ho chieu", "ho chieu cua be"],
    not: ["cua anh", "ho chieu anh"],
    reply: "Hộ chiếu Na hết hạn 03/2027, còn 7 tháng, cấp tại PA08 TP.HCM. Trong hồ sơ có sẵn 2 bản sao nếu trường xin đầu năm học.",
    src: "hồ sơ nhà mình",
    files: true,
    cta: "Mở hồ sơ Na",
    chips: ["Khi nào phải gia hạn hộ chiếu?", "Sổ tiêm chủng hai bé đủ chưa?", "Giấy tờ nhà mình để ở đâu?"]
  },
  {
    id: "passport_renew",
    k: ["gia han ho chieu", "lam lai ho chieu", "doi ho chieu", "khi nao gia han ho chieu",
        "ho chieu sap het han", "xin ho chieu moi", "lam ho chieu cho con"],
    must: ["han", "lam", "doi", "moi", "sap"],
    reply: "Nhiều nước bắt hộ chiếu còn ít nhất 6 tháng, nên Mai đặt nhắc gia hạn vào 09/2026. Nhà mình tính đi đâu trước 03/2027 thì anh báo, Mai tính lùi lại.",
    src: "hồ sơ nhà mình",
    files: true,
    cta: "Xem hộ chiếu Na",
    chips: ["Hộ chiếu Na hết hạn khi nào?", "Giấy tờ nhà mình để ở đâu?", "Sổ tiêm chủng hai bé đủ chưa?"]
  },
  {
    id: "tiem_chung",
    k: ["so tiem chung", "tiem chung", "con tiem du chua", "tiem du mui chua", "mui tiem",
        "tiem phong", "so tiem", "hai be tiem du chua"],
    reply: "Bin đủ mũi theo tuổi 9, Na đủ mũi theo tuổi 12, mũi gần nhất là cúm tháng 11/2025. Mai gom từ sổ giấy anh chụp và tin trạm y tế.",
    src: "sổ tiêm chủng",
    files: true,
    cta: "Mở sổ tiêm chủng",
    chips: ["Na tiêm HPV khi nào?", "Hộ chiếu Na hết hạn khi nào?", "Giấy tờ nhà mình để ở đâu?"]
  },
  {
    id: "hpv_na",
    k: ["hpv", "mui hpv", "na tiem hpv", "tiem hpv khi nao", "vac xin hpv", "hpv cho be gai"],
    must: ["hpv"],
    w: 2,
    reply: "Na 12 tuổi, đúng khoảng khuyến nghị 12 tới 14 tuổi cho mũi HPV. Anh đồng ý thì Mai tìm điểm tiêm gần Thảo Điền và giữ chỗ cuối tuần.",
    src: "sổ tiêm chủng",
    files: true,
    cta: "Xem sổ tiêm chủng",
    chips: ["Sổ tiêm chủng hai bé đủ chưa?", "Hộ chiếu Na hết hạn khi nào?", "Giấy tờ nhà mình để ở đâu?"]
  },

  // ————— KÉT GIẤY TỜ —————
  {
    id: "giay_to_o_dau",
    k: ["giay to o dau", "giay to nha minh", "ho so nha minh", "giay to de dau", "tim giay to",
        "cat giay to o dau", "luu giay to", "giay to gia dinh"],
    reply: "Tất cả nằm trong Hồ sơ nhà mình: đăng kiểm, hộ chiếu Na, sổ tiêm chủng, học phí, vé và hoá đơn điện. Mai đọc từ ảnh anh chụp nên không phải lục tủ nữa.",
    src: "hồ sơ nhà mình",
    files: true,
    cta: "Mở hồ sơ nhà mình",
    chips: ["Khi nào xe hết hạn đăng kiểm?", "Hộ chiếu Na hết hạn khi nào?", "Học phí quý 3 đã đóng chưa?"]
  },
  {
    id: "mo_ket",
    k: ["mo ket", "mo ho so", "xem ho so", "cho anh xem giay to", "mo giay to",
        "ket nha minh", "xem het giay to", "mo ket giay to"],
    reply: "Mai mở hồ sơ nhà mình đây anh, sáu mục. Chỉ đăng kiểm là đang cần để ý, năm mục còn lại đều còn hạn.",
    src: "hồ sơ nhà mình",
    files: true,
    cta: "Mở hồ sơ nhà mình",
    chips: ["Khi nào xe hết hạn đăng kiểm?", "Học phí quý 3 đã đóng chưa?", "Điện tháng 7 trả chưa?"]
  },
  {
    id: "cccd_dinh_danh",
    k: ["cccd", "can cuoc", "dinh danh", "cccd gan voi cai gi", "the can cuoc",
        "so cccd", "dinh danh cccd", "cccd dung o dau"],
    not: ["ve concert", "sang nhuong"],
    reply: "CCCD ···· 4102 của anh đang gắn với chữ ký số, ví WinMoney, vé sự kiện và giấy tờ xe. Định danh một lần rồi dùng lại khắp nơi, anh không phải đọc số ra ngoài cho ai.",
    src: "định danh nhà mình",
    files: true,
    cta: "Xem hồ sơ định danh",
    chips: ["Giấy tờ nhà mình để ở đâu?", "Mai lọc cuộc gọi kiểu gì?", "Đăng kiểm cần mang giấy gì?"]
  },

  // ————— LỪA ĐẢO · CUỘC GỌI GIẢ —————
  {
    id: "lua_dao_chung",
    k: ["lua dao", "bi lua", "canh giac lua dao", "tranh lua dao", "lua dao qua dien thoai",
        "dau hieu lua dao", "gia mao", "co lua dao khong", "gia danh cong an", "goi gia danh", "cuoc goi gia danh", "chan cuoc goi gia"],
    must: ["lua", "mao", "gia danh"],
    reply: "Ba dấu hiệu chung: giục gấp, đòi chuyển tiền ngay, và dặn đừng nói với ai trong nhà. Mai đối chiếu mặt, giọng và số máy trước khi chuông kịp đổ lần hai.",
    src: "chặn giả mạo",
    flow: "call",
    cta: "Xem Mai chặn cuộc gọi",
    chips: ["Có người xưng là con gọi xin tiền", "Trường gọi xin tiền có thật không?", "Mai lọc cuộc gọi kiểu gì?"]
  },
  {
    id: "goi_gia_con",
    k: ["co nguoi xung la con", "con goi xin tien", "na goi xin tien", "bin goi xin tien",
        "goi video gia", "gia giong con", "con mat dien thoai xin tien", "co nguoi gia con anh"],
    w: 2,
    reply: "Vừa có số lạ gọi video xưng là Na xin 8.500.000đ, mặt và giọng đều không khớp định danh, mà giờ này Na đang ở lớp bơi. Mai giữ máy chờ anh quyết, Mai không tự cúp.",
    src: "chặn giả mạo",
    flow: "call",
    cta: "Xem cuộc gọi",
    chips: ["Mai lọc cuộc gọi kiểu gì?", "Lỡ cho số rồi thì làm sao?", "Ai đón Bin chiều nay?"]
  },
  {
    id: "truong_xin_tien",
    k: ["truong goi xin tien", "co giao goi xin tien", "nha truong doi tien", "co xung la truong",
        "truong bao chuyen tien", "con bi tai nan phai chuyen tien", "nguoi xung la nha truong"],
    w: 2,
    reply: "TH Lê Lợi và THCS Trần Phú chưa bao giờ gọi đòi chuyển tiền gấp, khoản thu nào cũng đi qua cô chủ nhiệm trong nhóm lớp. Anh đừng chuyển, để Mai gọi lại số chính thức của trường xác minh.",
    src: "chặn giả mạo",
    flow: "call",
    cta: "Để Mai xác minh",
    chips: ["Học phí quý 3 đã đóng chưa?", "Mai lọc cuộc gọi kiểu gì?", "Có người xưng là con gọi xin tiền"]
  },
  {
    id: "mai_loc_cuoc_goi",
    k: ["mai loc cuoc goi kieu gi", "chan so la", "loc cuoc goi", "so la goi", "mai kiem tra cuoc goi",
        "chan cuoc goi rac", "so khong quen goi", "lam sao biet ai goi"],
    reply: "Mai đối chiếu số máy với danh bạ, so mặt và giọng với hồ sơ nhà mình, rồi xem giờ đó người ta đáng lẽ đang ở đâu theo lịch. Lệch một thứ là Mai cảnh báo ngay trên màn hình trong lúc anh nghe.",
    src: "chặn giả mạo",
    flow: "call",
    cta: "Xem Mai chặn cuộc gọi",
    chips: ["Có người xưng là con gọi xin tiền", "Lỡ cho số rồi thì làm sao?", "Họ xin mã OTP thì sao?"]
  },
  {
    id: "da_lo_so",
    k: ["lo cho so roi", "da doc so tai khoan", "lo doc otp", "da cho so dien thoai",
        "lo noi so tai khoan", "da chuyen tien roi", "lo cung cap thong tin", "trot cho so tai khoan"],
    w: 2,
    reply: "Mai khoá thẻ trước, việc đó làm ngay được, rồi đổi mật khẩu WinMoney và báo số kia cho cả nhà. Nếu tiền đã chuyển đi thì báo ngân hàng trong 24 giờ, nhiều trường hợp vẫn chặn lại kịp.",
    src: "chặn giả mạo",
    flow: "call",
    cta: "Khoá và báo số",
    chips: ["Mai lọc cuộc gọi kiểu gì?", "Số dư WinMoney còn bao nhiêu?", "Họ xin mã OTP thì sao?"]
  },
  {
    id: "otp_ma",
    k: ["otp", "ma otp", "ho xin ma otp", "doc ma cho ho", "ma xac thuc", "co nguoi xin ma otp"],
    must: ["otp"],
    reply: "Không đọc mã cho ai hết, kể cả người xưng là ngân hàng hay công an. Không ai có quyền hỏi anh mã OTP qua điện thoại, hỏi là giả.",
    src: "chặn giả mạo",
    flow: "call",
    cta: "Xem Mai chặn cuộc gọi",
    chips: ["Lỡ cho số rồi thì làm sao?", "Có người xưng là con gọi xin tiền", "Mai lọc cuộc gọi kiểu gì?"]
  },
];

// pack: shop
// Mua sắm, cơm nước và hệ sinh thái nhà mình.
// WinMart+ (Supra giao, điểm WinX) · MEATDeli · Chin-su · Omachi · Phúc Long.
// Giỏ bò kho mặc định: 5 món, 186.000đ, cộng 186 điểm WinX.

const PACK_SHOP = [
  // ————— tối nay ăn gì —————
  {
    id: "shop_dinner_tonight",
    k: ["toi nay an gi", "toi nay nau gi", "nau gi toi nay", "an gi toi nay", "com toi nay", "toi nay com gi", "bua toi nay", "chieu nay nau gi", "toi nay lam mon gi"],
    w: 1.2,
    reply: "Bài bò kho nồi áp suất đang đứng đầu kênh Cơm tối 30 phút, 6 nguyên liệu và 30 phút là xong. Mai soạn sẵn giỏ cho nhà 4 người, 186.000đ.",
    src: "kênh Cơm tối 30 phút",
    flow: "cart",
    cta: "Xem giỏ 186.000đ",
    chips: ["Bò kho cần mua những gì?", "Supra giao lúc mấy giờ?", "Đơn này được bao nhiêu điểm WinX?"],
  },
  {
    id: "shop_quick_30",
    k: ["nau nhanh", "mon nhanh", "30 phut", "ba muoi phut", "nau gi cho nhanh", "khong co thoi gian nau", "ve tre nau gi", "mon nao nhanh nhat"],
    reply: "Nhà mình về trễ thì bò kho nồi áp suất nhanh nhất, 15 phút áp suất là thịt mềm. Mai đặt đủ nguyên liệu, Supra giao 18:00 là anh kịp bắc nồi.",
    src: "mẹ Su · 462 ủng hộ",
    flow: "cart",
    cta: "Đặt nguyên liệu",
    chips: ["Tối nay mấy giờ tập cuối?", "Bò kho cần mua những gì?", "Đổi giờ giao sớm hơn được không?"],
  },
  {
    id: "shop_family_suggest",
    k: ["goi y bua toi cho ca nha", "goi y bua toi", "goi y mon an", "goi y an gi", "mai goi y mon", "bua toi cho ca nha", "goi y cho ca nha", "nau gi ca nha thich"],
    reply: "Bò kho hợp cả nhà, Bin húp nước còn Na chấm bánh mì. Nếu anh muốn nhẹ hơn thì có canh chua cá lóc 25 phút của cô Sáu.",
    src: "kênh Cơm tối 30 phút",
    flow: "cart",
    cta: "Lấy giỏ bò kho",
    chips: ["Canh chua cá lóc nấu sao?", "Giỏ hàng bao nhiêu tiền?", "Ai đón Bin chiều nay?"],
  },

  // ————— bò kho —————
  {
    id: "shop_bokho",
    k: ["bo kho", "nau bo kho", "lam bo kho", "mon bo kho", "bai bo kho", "bo kho noi ap suat"],
    reply: "Bò kho của mẹ Su chỉ 6 nguyên liệu, gia vị bò kho Chin-su pha sẵn cộng 15 phút nồi áp suất. Giỏ cho nhà 4 người 186.000đ.",
    src: "mẹ Su · 462 ủng hộ",
    flow: "cart",
    cta: "Đặt 186.000đ",
    chips: ["Bò kho cần mua những gì?", "Supra giao lúc mấy giờ?", "Mua sữa cho Bin nữa nha"],
  },
  {
    id: "shop_bokho_items",
    k: ["bo kho can gi", "nguyen lieu bo kho", "mua gi nau bo kho", "bo kho mua gi", "can mua nhung gi", "nguyen lieu can mua", "trong gio co gi", "gio gom nhung gi", "gom nhung mon gi", "co nhung mon gi", "gom mon gi", "gia tung mon"],
    reply: "Bò nạm MEATDeli 500g, cà rốt, sả gừng, gói gia vị bò kho Chin-su và 2 ổ bánh mì. Đủ 5 món, Mai chia sẵn theo khẩu phần nhà 4 người.",
    src: "công thức mẹ Su",
    flow: "cart",
    cta: "Mở giỏ",
    chips: ["Giỏ hàng bao nhiêu tiền?", "Thịt bò MEATDeli giá sao?", "Mua ngoài chợ có rẻ hơn không?"],
  },
  {
    id: "shop_channel_com",
    k: ["kenh com toi", "kenh nau an", "cong thuc nau an", "xem cong thuc", "cong thuc bo kho", "kenh 30 phut", "mo kenh nau an", "co mon gi hay"],
    reply: "Kênh Cơm tối 30 phút đang có bò kho nồi áp suất 462 ủng hộ và canh chua cá lóc 25 phút. Mai mở kênh cho anh xem.",
    goto: "com",
    cta: "Mở kênh",
    chips: ["Bò kho cần mua những gì?", "Gợi ý bữa tối cho cả nhà", "Canh chua cá lóc nấu sao?"],
  },
  {
    id: "shop_canhchua",
    k: ["canh chua", "ca loc", "canh chua ca loc", "mon mien tay", "nau canh chua", "canh chua nau sao"],
    reply: "Canh chua cá lóc của cô Sáu 25 phút là xong, cá đồng WinMart+ sáng nào cũng có. Mai mở bài cho anh xem trước.",
    src: "cô Sáu Cà Mau",
    goto: "com",
    cta: "Xem công thức",
    chips: ["Đặt đồ đi chợ giúp anh", "Tối nay ăn gì?", "Supra giao lúc mấy giờ?"],
  },

  // ————— đi chợ —————
  {
    id: "shop_out_of_food",
    k: ["het do an", "nha het do an", "tu lanh trong", "het thuc pham", "khong con gi an", "het do trong tu lanh", "het do trong nha"],
    reply: "Mai gom sẵn một giỏ theo đồ nhà mình hay mua, đủ thịt rau và gia vị cho hai ba bữa. WinMart+ Thảo Điền cách 1,4km, Supra giao ngay trong chiều nay.",
    src: "giỏ tuần trước",
    flow: "cart",
    cta: "Soạn giỏ",
    chips: ["Giỏ hàng bao nhiêu tiền?", "Mua sữa cho Bin nữa nha", "Số dư WinMoney còn bao nhiêu?"],
  },
  {
    id: "shop_order_groceries",
    k: ["dat do di cho", "di cho", "dat do an", "dat winmart", "dat hang winmart", "mua do di cho", "dat tap hoa", "di cho gium anh", "dat do sieu thi"],
    not: ["di choi"],
    w: 1.2,
    reply: "Mai đặt ở WinMart+ Thảo Điền, Supra giao tận cửa Zeit River T1.02.06. Anh xem lại giỏ rồi chốt giờ giao là xong.",
    flow: "cart",
    cta: "Mở giỏ WinMart+",
    chips: ["Giỏ hàng bao nhiêu tiền?", "Supra giao lúc mấy giờ?", "Đơn này được bao nhiêu điểm WinX?"],
  },
  {
    id: "shop_reorder",
    k: ["dat lai gio tuan truoc", "dat lai gio", "gio tuan truoc", "mua nhu lan truoc", "dat nhu cu", "lap lai don", "dat lai don cu"],
    reply: "Giỏ tuần trước Mai còn giữ, 5 món 186.000đ. Anh sửa số lượng rồi chốt giờ giao, khỏi soạn lại từ đầu.",
    src: "giỏ tuần trước",
    flow: "cart",
    cta: "Đặt lại",
    chips: ["Mua sữa cho Bin nữa nha", "Đổi giờ giao sớm hơn được không?", "Đơn này được bao nhiêu điểm WinX?"],
  },
  {
    id: "shop_milk_bin",
    k: ["mua sua cho bin", "sua cho bin", "het sua", "mua sua", "them sua", "sua tuoi", "sua cho con"],
    must: ["sua"],
    not: ["sua xe", "sua chua don", "sua so dien thoai"],
    reply: "Mai thêm lốc sữa tươi ít đường 4 hộp 32.000đ, đúng loại Bin vẫn uống. Đi chung chuyến Supra chiều nay nên không tốn thêm phí giao.",
    src: "giỏ tuần trước",
    flow: "cart",
    cta: "Thêm vào giỏ",
    chips: ["Giỏ hàng bao nhiêu tiền?", "Supra giao lúc mấy giờ?", "Ai đón Bin chiều nay?"],
  },

  // ————— tiền và điểm —————
  {
    id: "shop_cart_total",
    k: ["gio hang bao nhieu", "tam tinh", "tong gio hang", "gio het bao nhieu", "tong don bao nhieu", "don nay bao nhieu"],
    must: ["gio", "don", "tam tinh"],
    reply: "Giỏ đang 186.000đ cho 5 món, riêng bò nạm MEATDeli đã 139.000đ. Thêm mì Omachi hay chuối thì Mai cộng lại ngay cho anh.",
    flow: "cart",
    cta: "Xem từng món",
    chips: ["Đơn này được bao nhiêu điểm WinX?", "Số dư WinMoney còn bao nhiêu?", "Mua ngoài chợ có rẻ hơn không?"],
  },
  {
    id: "shop_winx_points",
    k: ["diem winx", "duoc bao nhieu diem", "tich diem", "don nay duoc may diem", "winx", "diem thuong", "may diem", "cong diem the nao"],
    must: ["diem", "winx"],
    reply: "Đơn 186.000đ cộng 186 điểm WinX, cứ 1.000đ được 1 điểm. Phải trả bằng WinMoney mới cộng, trả tiền mặt khi nhận thì mất điểm.",
    flow: "cart",
    cta: "Đặt đơn",
    chips: ["Sao đăng kiểm không được điểm?", "Số dư WinMoney còn bao nhiêu?", "Giỏ hàng bao nhiêu tiền?"],
  },
  {
    id: "shop_winx_none",
    k: ["dang kiem co diem khong", "sao khong duoc diem", "khong duoc diem", "viec nao khong co diem", "hoc phi co diem khong", "tra hoc phi co diem khong", "sao dang kiem khong co diem"],
    must: ["diem"],
    reply: "Đăng kiểm với học phí là việc không thuộc Masan nên không cộng điểm, Mai vẫn làm giúp anh như thường. Điểm WinX chỉ cộng ở WinMart+, MEATDeli và Phúc Long.",
    src: "quy tắc điểm WinX",
    chips: ["Khi nào đăng kiểm xe?", "Đơn này được bao nhiêu điểm WinX?", "Trà sen cho Bà bao nhiêu?"],
  },
  {
    id: "shop_compare_price",
    k: ["so gia", "cho nao re hon", "co re hon khong", "dat hay re", "so sanh gia", "mua ngoai cho re hon khong", "gia co tot khong", "mua ngoai re hon"],
    not: ["dang kiem"],
    reply: "Bò nạm MEATDeli 139.000đ nhỉnh hơn chợ chừng 10.000đ, đổi lại có nguồn gốc và đổi trả được. Điểm WinX chỉ đáng vài trăm đồng thôi, anh mua vì đỡ một chuyến chợ thì đúng hơn.",
    flow: "cart",
    cta: "Xem từng món",
    chips: ["Thịt bò MEATDeli giá sao?", "Đơn này được bao nhiêu điểm WinX?", "Giỏ hàng bao nhiêu tiền?"],
  },

  // ————— giao hàng —————
  {
    id: "shop_supra_time",
    k: ["supra giao luc may gio", "khi nao giao", "bao lau thi giao", "giao luc may gio", "may gio giao hang", "giao hang khi nao", "shipper toi chua", "supra"],
    reply: "Mai để mặc định 18:00 cho anh kịp nấu trước tập cuối 20:00, khung 17:30 còn 2 tài. Supra giao tận cửa T1.02.06 Zeit River.",
    flow: "cart",
    cta: "Chọn giờ giao",
    chips: ["Đổi giờ giao sớm hơn được không?", "Giỏ hàng bao nhiêu tiền?", "Tối nay mấy giờ tập cuối?"],
  },
  {
    id: "shop_delivery_change",
    k: ["doi gio giao", "giao som hon", "giao muon hon", "doi khung gio", "giao truoc 6 gio", "chuyen gio giao", "giao som duoc khong"],
    reply: "Còn trống 17:30, 18:30 và 19:30, riêng khung 19:00 đã kín tài. Anh chọn khung nào Mai đổi luôn trong đơn.",
    flow: "cart",
    cta: "Đổi giờ giao",
    chips: ["Supra giao lúc mấy giờ?", "Đặt đồ đi chợ giúp anh", "Đồ ăn vặt tối nay đặt gì?"],
  },

  // ————— nhãn hàng trong hệ —————
  {
    id: "shop_meatdeli",
    k: ["thit mat", "meatdeli", "bo nam", "mua thit", "thit bo", "thit tuoi", "thit lon", "thit lonn", "thit heo", "mua thit bo", "thit ngon"],
    reply: "Bò nạm MEATDeli 500g 139.000đ, thịt mát nên kho xong không bã. Quầy tươi WinMart+ Thảo Điền soạn rồi Supra giao trong ngày.",
    flow: "cart",
    cta: "Thêm vào giỏ",
    chips: ["Bò kho cần mua những gì?", "Mua ngoài chợ có rẻ hơn không?", "Giỏ hàng bao nhiêu tiền?"],
  },
  {
    id: "shop_chinsu",
    k: ["chin su", "gia vi bo kho", "nuoc mam", "mua gia vi", "nam ngu", "gia vi con khong"],
    reply: "Gói gia vị bò kho Chin-su 12.000đ đã nằm trong giỏ, cái ngon của bài mẹ Su là ở gói đó. Nước mắm Nam Ngư 500ml 28.000đ thì Mai để anh chọn thêm.",
    flow: "cart",
    cta: "Xem giỏ",
    chips: ["Bò kho cần mua những gì?", "Mì Omachi mua thêm nha", "Giỏ hàng bao nhiêu tiền?"],
  },
  {
    id: "shop_omachi",
    k: ["mi omachi", "omachi", "mua mi goi", "mi goi", "mi bo ham", "them mi", "mua mi an lien"],
    reply: "Mì Omachi bò hầm lốc 5 gói 34.000đ, để sẵn cho hôm nào anh về trễ. Mai thêm vào giỏ, đi chung chuyến chiều nay.",
    flow: "cart",
    cta: "Thêm 34.000đ",
    chips: ["Giỏ hàng bao nhiêu tiền?", "Đặt đồ đi chợ giúp anh", "Đồ ăn vặt tối nay đặt gì?"],
  },
  {
    id: "shop_snack_atsh",
    k: ["do an vat", "an vat toi nay", "xem tap cuoi an gi", "combo snack", "bap rang", "do nham", "an gi khi xem", "do an xem tv"],
    reply: "Tập cuối 20:00, Mai gom combo bắp rang với nước cho 4 người, Supra giao trước 19:30. Ghép chung chuyến với giỏ bò kho thì khỏi tốn phí giao.",
    flow: "cart",
    cta: "Đặt combo",
    chips: ["Tối nay mấy giờ tập cuối?", "Supra giao lúc mấy giờ?", "Tối nay ăn gì?"],
  },

  // ————— quà cho Bà —————
  {
    id: "shop_tea_ba",
    k: ["tra sen", "qua cho ba", "tra sen cho ba", "mua qua cho ba", "hop qua cho ba", "phuc long", "qua gio ong", "mua tra sen",
        "mua qua gi cho ba", "ba thich gi", "bieu ba gi", "mang gi ve gio ong"],
    w: 2,
    reply: "Hộp quà trà sen Phúc Long 165.000đ, đúng loại Bà hay uống. Đặt hôm nay thì Supra giao thứ Sáu, kịp giỗ Ông thứ Bảy.",
    src: "hồ sơ nhà mình",
    cta: "Mua hộp trà",
    action: { label: "Mua 165.000đ", amount: 165000 },
    chips: ["Giỗ Ông thứ Bảy chuẩn bị gì?", "Số dư WinMoney còn bao nhiêu?", "Supra giao lúc mấy giờ?"],
  },
  {
    id: "shop_tea_price",
    k: ["tra sen bao nhieu", "hop tra bao nhieu", "qua cho ba bao nhieu", "hop qua bao nhieu tien", "tra sen gia bao nhieu", "hop tra sen gia"],
    must: ["tra", "qua", "sen"],
    reply: "Hộp quà trà sen Phúc Long 165.000đ, đã gồm hộp giấy và thiệp viết tay. Trừ WinMoney còn 2.315.000đ và cộng thêm 165 điểm WinX.",
    src: "hồ sơ nhà mình",
    cta: "Mua hộp trà",
    action: { label: "Mua 165.000đ", amount: 165000 },
    chips: ["Giỗ Ông thứ Bảy chuẩn bị gì?", "Đơn này được bao nhiêu điểm WinX?", "Số dư WinMoney còn bao nhiêu?"],
  },
];

// pack: life
// giải trí · định danh · chào hỏi · lưới an toàn
// 24 intents + FALLBACKS (6) + GREETING_CHIPS (6)

const PACK_LIFE = [

  // ————— MAI LÀ AI · MAI LÀM ĐƯỢC GÌ —————
  {
    id: "mai_who",
    k: ["mai la ai", "em la ai", "ban la ai", "mai la gi", "m ai la gi", "gioi thieu ve mai", "gioi thieu di", "mai oi mai la ai", "ai dang tra loi"],
    w: 2,
    reply: "Mai là trợ lý của nhà mình, giữ giấy tờ, lịch và các khoản phải đóng ở chung một chỗ. Anh giao việc thì Mai làm tới lúc xong rồi báo lại anh.",
    chips: ["Mai làm được gì?", "Hôm nay còn việc gì gấp?", "Mai lưu những gì của nhà mình?"],
  },
  {
    id: "mai_can_do",
    k: ["mai lam duoc gi", "lam duoc nhung gi", "giup duoc gi", "co the lam gi", "chuc nang gi", "mai giup gi duoc", "mai biet lam gi", "co gi hay khong"],
    w: 2,
    reply: "Trả tiền học, ký đơn cho trường, chốt người đón con, đi chợ, đặt đăng kiểm, canh vé concert. Việc nào Mai đưa ra nút là Mai đi tới cuối, không bỏ giữa chừng.",
    chips: ["Trả học bơi cho Bin", "Đặt lịch đăng kiểm xe", "Mai canh vé giúp anh lúc 20:00 thứ Sáu"],
  },
  {
    id: "mai_vs_assistant",
    k: ["khac tro ly thuong", "khac gi chatgpt", "khac gi google", "khac gi siri", "khac gi zalo", "khac gi shopee", "hon zalo cho nao", "giong zalo khong", "khac gi cac tro ly khac", "mai khac gi", "tai sao dung mai", "co gi dac biet", "hon cho nao"],
    reply: "Trợ lý thường trả lời xong là hết, Mai thì làm luôn rồi ghi lại vào hồ sơ nhà mình. Lần sau anh khỏi phải kể lại từ đầu.",
    chips: ["Mai làm được gì?", "Mai lưu những gì của nhà mình?", "Trả học bơi cho Bin"],
  },

  // ————— RIÊNG TƯ —————
  {
    id: "mai_reads_messages",
    k: ["doc tin nhan", "mai co doc tin nhan cua anh khong", "co doc trom khong", "sao mai biet het", "mai biet het vay", "ai doc duoc tin nhan", "doc chat cua toi", "co nghe len khong", "co theo doi toi khong", "mai co doc het khong", "co doc zalo khong"],
    w: 2,
    reply: "Mai chỉ đọc đúng thứ anh đưa vào: tin Vy chuyển tiếp, email anh chia sẻ, giấy tờ anh chụp. Zalo và hộp thư riêng của anh Mai không tự vào.",
    src: "quyền anh đã bật",
    chips: ["Mai lưu những gì của nhà mình?", "Ai đọc được đoạn chat này?", "Tắt bớt quyền của Mai"],
  },
  {
    id: "mai_privacy_store",
    k: ["mai luu gi", "luu nhung gi", "du lieu cua toi", "mai giu gi", "ket ky uc", "luu o dau", "data cua toi", "mai co luu lai khong", "thong tin nha minh nam o dau"],
    w: 2,
    reply: "Giấy tờ, hoá đơn và lịch của nhà đều nằm trong hồ sơ nhà mình, khoá riêng theo từng người. Anh mở xem được từng món và xoá món nào cũng được.",
    src: "hồ sơ nhà mình",
    files: true,
    cta: "Mở hồ sơ nhà mình",
    chips: ["Ai đọc được đoạn chat này?", "Hộ chiếu Na còn hạn không?", "Tắt bớt quyền của Mai"],
  },
  {
    id: "mai_who_sees_chat",
    k: ["ai doc duoc doan chat nay", "ai thay duoc doan nay", "vy co doc duoc khong", "chat nay co ai thay", "ai xem duoc tin nhan nay", "co rieng tu khong", "ai doc duoc"],
    reply: "Chỉ anh và Mai. Vy, Na, Bin mỗi người một két riêng, chuyện của người này Mai không kể cho người kia.",
    chips: ["Mai lưu những gì của nhà mình?", "Mai có đọc tin nhắn của anh không?", "Mai khác trợ lý thường chỗ nào?"],
  },
  {
    id: "mai_turn_off",
    k: ["tat bot quyen", "dung doc nua", "xoa du lieu", "tat mai di", "khong cho mai doc", "gioi han quyen", "tat quyen cua mai", "xoa het thong tin", "khoa lai"],
    reply: "Mỗi nguồn một công tắc riêng, anh tắt nguồn nào Mai thôi đọc nguồn đó ngay từ lúc đó. Muốn xoá sạch két thì một chạm là xong, Mai không giữ bản sao.",
    files: true,
    cta: "Mở hồ sơ nhà mình",
    chips: ["Mai lưu những gì của nhà mình?", "Ai đọc được đoạn chat này?", "Mai có đọc tin nhắn của anh không?"],
  },

  // ————— CHÀO HỎI · XÃ GIAO —————
  {
    id: "greet",
    k: ["chao mai", "chao em", "hello", "hi mai", "alo", "mai oi", "chao buoi chieu", "xin chao", "chao anh chi", "chao"],
    not: ["chao long"],
    reply: "Chiều anh Hải. Trước 17:00 còn hai việc: học bơi của Bin chưa đóng và chưa chốt ai đón Bin lúc 16:30.",
    chips: ["Trả học bơi cho Bin", "Ai đón Bin chiều nay?", "Tối nay nhà mình xem gì?"],
  },
  {
    id: "how_are_you",
    k: ["mai khoe khong", "em khoe khong", "dao nay the nao", "co gi moi khong", "hom nay the nao", "the nao roi", "on khong", "co ban khong"],
    reply: "Mai ổn anh, đang canh mấy mốc giờ trong chiều nay. Gấp nhất là học bơi của Bin, còn 1 tiếng 18 phút.",
    chips: ["Trả học bơi cho Bin", "Hôm nay còn việc gì gấp?", "Ai đón Bin chiều nay?"],
  },
  {
    id: "thanks",
    k: ["cam on", "cam on mai", "cam on em", "cam on nhe", "thanks", "thank you", "tks", "gioi lam", "ngon lanh", "may qua co mai"],
    reply: "Dạ, việc của Mai mà anh. Cần gì anh cứ gọi Mai.",
    chips: ["Hôm nay còn việc gì gấp?", "Tối nay nhà mình xem gì?", "Mai làm được gì?"],
  },
  {
    id: "confirm_bare",
    k: ["ok", "oke", "okie", "oki", "uh", "uhm", "ukm", "u di", "u nhe", "u anh", "u lam di", "lam di", "lam luon di", "chot", "chot di", "chot luon", "dong y", "tien hanh", "duoc roi", "cu the di", "trien khai"],
    not: ["lam duoc gi", "bao nhieu", "khi nao", "the nao", "o dau", "tai sao"],
    w: 2,
    reply: "Dạ anh. Việc sát hạn nhất là học bơi của Bin, Mai mở sẵn để anh xem lại rồi trả.",
    src: "Vy chuyển tiếp",
    flow: "pay",
    cta: "Trả 850.000đ",
    chips: ["Ai đón Bin chiều nay?", "Đơn dã ngoại của Na", "Đặt lịch đăng kiểm xe"],
  },
  {
    id: "time_now",
    k: ["may gio roi", "bay gio may gio", "hom nay thu may", "hom nay ngay may", "thu may roi", "ngay bao nhieu", "bay gio la may gio"],
    reply: "15:42 chiều thứ Tư, ngày 06/08. Còn 48 phút nữa Bin tan lớp bơi và 1 tiếng 18 phút tới hạn đóng học phí.",
    chips: ["Ai đón Bin chiều nay?", "Trả học bơi cho Bin", "Hôm nay còn việc gì gấp?"],
  },

  // ————— THỨ MAI KHÔNG BIẾT —————
  {
    id: "weather",
    k: ["thoi tiet", "troi mua khong", "co mua khong", "chieu nay mua khong", "nong khong", "bao nhieu do", "troi the nao", "co bao khong"],
    reply: "Thời tiết Mai chưa nối nguồn nên không dám nói bừa, anh xem app thời tiết cho chắc. Nếu anh lo mưa lúc tan lớp thì Mai dời giờ đón Bin sớm 10 phút.",
    flow: "pickup",
    cta: "Chốt người đón Bin",
    chips: ["Ai đón Bin chiều nay?", "Đặt giỏ WinMart+ tối nay", "Tối nay nấu gì nhanh?"],
  },
  {
    id: "cant_know",
    k: ["gia vang", "ty gia", "ket qua bong da", "chung khoan", "gia bitcoin", "xo so", "tin tuc hom nay", "ty so tran", "gia xang hom nay", "mai co biet khong"],
    reply: "Cái này ngoài hồ sơ nhà mình nên Mai không đoán, anh tra chỗ khác cho chắc. Còn chuyện trong nhà thì Mai có sẵn con số cho anh.",
    chips: ["Hôm nay còn việc gì gấp?", "Số dư WinMoney còn bao nhiêu?", "Mai làm được gì?"],
  },

  // ————— ANH TRAI SAY HI · TỐI NAY —————
  {
    id: "atsh_tonight",
    k: ["toi nay xem gi", "toi nay nha minh xem gi", "toi nay co gi", "xem gi toi nay", "tap cuoi toi nay", "anh trai say hi toi nay", "toi nay co gi hay", "buoi toi lam gi"],
    reply: "Tập cuối Anh Trai Say Hi 20:00 tối nay, Bin với Na đều theo nên cả nhà xem chung được. Mai để Supra giao đồ ăn 18:00 cho anh kịp nấu và ăn xong trước giờ chiếu.",
    src: "kênh Anh Trai Say Hi",
    goto: "atsh",
    cta: "Mở kênh",
    chips: ["Đặt giỏ WinMart+ tối nay", "Vé concert đợt 3 khi nào mở?", "Tối nay nấu gì nhanh?"],
  },
  {
    id: "atsh_watch_together",
    k: ["may gio tap cuoi", "tap cuoi may gio", "xem chung o dau", "coi tap cuoi o dau", "chieu len tivi", "xem tren tivi", "xem cung ca nha", "ba co xem duoc khong", "mo tap cuoi"],
    reply: "20:00 tối nay, Mai chiếu lên TV nhà mình và tắt thông báo trong lúc chiếu. Bà cũng xem được, Mai mở song song trên loa nhà Bà nếu anh muốn.",
    goto: "atsh",
    cta: "Mở kênh Anh Trai Say Hi",
    chips: ["Kênh nào anh đang theo dõi?", "Đặt giỏ WinMart+ tối nay", "Tối nay nhà mình xem gì?"],
  },

  // ————— VÉ ĐỢT 3 —————
  {
    id: "ticket_wave3",
    k: ["ve concert", "ve dot 3", "ve anh trai say hi", "mua ve concert", "khi nao mo ban ve", "ve mo ban khi nao", "san ve", "ve concert 5", "dot ban thu 3"],
    w: 2,
    reply: "Đợt 3 mở 20:00 thứ Sáu 08/08, khu B còn nhiều, mỗi CCCD tối đa 4 vé. Đợt 2 hết trong 7 phút nên anh để Mai canh sẵn thì chắc hơn.",
    src: "kênh Anh Trai Say Hi",
    flow: "ticket",
    cta: "Để Mai canh vé",
    chips: ["Vé khu B bao nhiêu một vé?", "Vé có sang tay được không?", "Mua lại vé của chị Ngân"],
  },
  {
    id: "ticket_price",
    k: ["ve khu b bao nhieu", "gia ve concert", "ve bao nhieu tien", "ve bao nhieu mot ve", "gia ve dot 3", "ve co dat khong", "hai ve het bao nhieu"],
    reply: "Khu A 1.490.000đ, khu B 890.000đ, khu C 590.000đ, tối đa 4 vé mỗi CCCD. Hai vé khu B là 1.780.000đ, ví WinMoney của anh còn 2.480.000đ nên đủ.",
    src: "kênh Anh Trai Say Hi",
    flow: "ticket",
    cta: "Chọn vé",
    chips: ["Mai canh vé giúp anh lúc 20:00 thứ Sáu", "Mua vé lại có bị lừa không?", "Số dư WinMoney còn bao nhiêu?"],
  },
  {
    id: "ticket_queue",
    k: ["canh ve giup anh", "mai canh ve", "dat ve di", "mua ve di", "tranh ve giup anh", "canh ve dot 3", "dang ky mua ve", "20h thu sau canh ve", "giu cho anh 2 ve"],
    w: 2,
    reply: "Mai nhắc lúc 19:55, tự mở trang đúng 20:00 và điền sẵn CCCD từng người. Anh chỉ bấm xác nhận, không phải gõ gì lúc tranh vé.",
    flow: "ticket",
    cta: "Đặt lịch canh vé",
    chips: ["Vé khu B bao nhiêu một vé?", "Vé có sang tay được không?", "Tối nay nhà mình xem gì?"],
  },
  {
    id: "ticket_cccd",
    k: ["ve gan cccd", "ve co sang tay duoc khong", "ban lai ve duoc khong", "ve co ten khong", "quet mat vao cong", "vao cong the nao", "ve co chuyen nhuong duoc khong", "cho muon ve duoc khong"],
    reply: "Vé gắn CCCD từng người, vào cổng quét mặt nên không sang tay bên ngoài được. Muốn nhượng thì sang tên ngay trong m.ai, không mất phí và tiền có WinMoney giữ hộ.",
    flow: "resale",
    cta: "Xem cách sang nhượng",
    chips: ["Mua lại vé của chị Ngân", "Mua vé lại có bị lừa không?", "Vé concert đợt 3 khi nào mở?"],
  },

  // ————— SANG NHƯỢNG VÉ · ESCROW —————
  {
    id: "resale_buy",
    k: ["mua lai ve", "sang nhuong ve", "chi ngan ban ve", "ve pass lai", "mua ve cua nguoi khac", "ai pass ve", "sang ten ve", "co ai nhuong ve khong"],
    w: 2,
    reply: "Chị Ngân trong kênh đang nhượng 2 vé khu B liền nhau B12-13, đúng giá gốc 890.000đ một vé. Chị đã định danh CCCD, bán ba lần trong kênh và chưa lần nào có chuyện.",
    src: "kênh Anh Trai Say Hi",
    flow: "resale",
    cta: "Xem vé chị Ngân",
    chips: ["Mua vé lại có bị lừa không?", "Vé có sang tay được không?", "Vé concert đợt 3 khi nào mở?"],
  },
  {
    id: "resale_safe",
    k: ["mua ve lai co bi lua khong", "co bi lua khong", "bi lua khong", "lua dao ve", "ve gia", "an toan khong", "tien co mat khong", "giu tien ho", "escrow", "co dam bao khong"],
    reply: "Tiền anh trả nằm trong ví WinMoney, người bán chưa cầm được đồng nào. Vé sang tên anh xong WinMoney mới chuyển cho họ, quá 24 giờ chưa sang được thì tiền tự về ví anh.",
    flow: "resale",
    cta: "Đặt cọc có giữ hộ",
    chips: ["Mua lại vé của chị Ngân", "Có cuộc gọi lạ nào không?", "Số dư WinMoney còn bao nhiêu?"],
  },

  // ————— KÊNH —————
  {
    id: "cars_channel",
    k: ["kenh xe", "vietnam cars", "kenh o to", "hoi xe", "kenh vietnam cars", "anh em choi xe", "kenh xe co gi", "bai ve xe", "kenh xe co gi moi"],
    reply: "Vietnam Cars 12,4k thành viên, mặt thật hết. Bài nóng nhất là mẹo đăng kiểm sáng thứ Ba của anh Tuấn, Mai lấy giờ chờ từ bài đó.",
    src: "kênh Vietnam Cars",
    goto: "cars",
    cta: "Mở kênh Vietnam Cars",
    chips: ["Đặt lịch đăng kiểm xe", "Xe còn hạn đăng kiểm không?", "Kênh nào anh đang theo dõi?"],
  },
  {
    id: "channels_mine",
    k: ["kenh nao anh dang theo doi", "toi theo doi kenh nao", "co nhung kenh gi", "danh sach kenh", "kenh cua toi", "kenh gi vay", "mo kenh"],
    reply: "Ba kênh: Vietnam Cars 12,4k, Cơm tối 30 phút 8,1k và Anh Trai Say Hi 214k. Kênh nào cũng định danh mặt thật, nên mua bán trong đó Mai giữ tiền hộ được.",
    goto: "home",
    cta: "Xem các kênh",
    chips: ["Kênh xe có gì mới?", "Tối nay nấu gì nhanh?", "Tối nay nhà mình xem gì?"],
  },

];

// ————— LƯỚI AN TOÀN · dùng khi không khớp intent nào —————
export const FALLBACKS = [
  {
    reply: "Mai chưa chắc ý anh. Anh nói gọn lại một câu, hoặc chọn giúp Mai một việc dưới đây.",
    chips: ["Hôm nay còn việc gì gấp?", "Mai làm được gì?", "Tối nay nấu gì nhanh?"],
  },
  {
    reply: "Câu này Mai chưa nắm, Mai nói thật để anh khỏi chờ. Giấy tờ, lịch và các khoản phải đóng của nhà thì anh cứ hỏi.",
    chips: ["Mai làm được gì?", "Xe còn hạn đăng kiểm không?", "Tối nay nhà mình xem gì?"],
  },
  {
    reply: "Mai chưa hiểu ý anh. Hay để Mai mở hồ sơ nhà mình, anh nhìn một lượt xem có gì cần làm trước.",
    chips: ["Mở hồ sơ nhà mình", "Xe còn hạn đăng kiểm không?", "Hộ chiếu Na còn hạn không?"],
  },
  {
    reply: "Chỗ này Mai chưa làm được. Còn canh giờ và nhắc việc thì anh cứ giao cho Mai.",
    chips: ["Nhắc tôi uống thuốc lúc 20:00", "Ai đón Bin chiều nay?", "Có cuộc gọi lạ nào không?"],
  },
  {
    reply: "Việc này Mai chưa làm được, Mai nói thật để anh khỏi mất công chờ. Mấy việc dưới đây thì Mai đi tới cuối được.",
    chips: ["Đặt lịch đăng kiểm xe", "Mai canh vé giúp anh lúc 20:00 thứ Sáu", "Đặt giỏ WinMart+ tối nay"],
  },
  {
    reply: "Mai đọc chưa ra ý anh. Anh thử nói theo việc xem sao: trả tiền gì, đón ai, đặt gì, mua gì.",
    chips: ["Mua lại vé của chị Ngân", "Có cuộc gọi lạ nào không?", "Mai làm được gì?"],
  },
];

// ————— GỢI Ý MỞ ĐẦU · khung chat còn trống —————
export const GREETING_CHIPS = [
  "Trả học bơi cho Bin",
  "Ai đón Bin chiều nay?",
  "Đơn dã ngoại của Na",
  "Tối nay nấu gì nhanh?",
  "Vé concert đợt 3 khi nào mở?",
  "Xe còn hạn đăng kiểm không?",
];

// ————— vá lỗ · các câu gợi ý trỏ tới nhưng chưa ai trả lời —————
// Mọi chuỗi trong `chips` đều phải khớp một ý định, nếu không cú chạm
// sẽ rơi vào câu đỡ. Mảng này đóng đúng những lỗ đó.
const PACK_GAPS = [
  {
    id: "urgent_now",
    k: ["con viec gi gap", "hom nay con viec gi gap", "viec gi gap", "co gi gap khong", "co gi gap",
        "viec gap", "gap nhat", "gap khong", "uu tien gi truoc", "lam gi truoc"],
    must: ["gap", "uu tien", "truoc"],
    w: 3,
    reply: "Gấp nhất là học bơi 850.000đ của Bin, hạn 17:00, còn 78 phút. Kế đó là chốt ai đón Bin lúc 16:30.",
    src: "Nhà mình · trước 17:00",
    flow: "pay",
    cta: "Trả học bơi",
    chips: ["Ai đón Bin chiều nay?", "Tôi nợ gì tuần này?", "Hôm nay có gì?"],
  },
  {
    id: "swim_cancel_tomorrow",
    k: ["chieu mai lop co nghi khong", "mai lop co nghi khong", "lop co nghi khong", "chieu mai co nghi",
        "mai co nghi hoc khong", "lop nghi khong", "mai bin co hoc khong", "mai co hoc boi khong"],
    must: ["nghi", "mai"],
    w: 2,
    reply: "Chiều mai lớp nghỉ, cô Lan báo giáo viên họp. Mai dời buổi bơi của Bin sang thứ Năm 17:00 và đã nhắn Vy.",
    src: "Vy chuyển tiếp · 15:44",
    goto: "family",
    cta: "Xem trong Nhà mình",
    chips: ["Bin học bơi hôm nào?", "Tuần này có gì?", "Ai đón Bin chiều nay?"],
  },
  {
    id: "cart_open_tonight",
    k: ["dat gio winmart", "dat gio winmart toi nay", "dat winmart", "dat do winmart", "gio winmart",
        "mua do winmart", "dat hang winmart", "dat gio hang", "dat gio", "di cho di", "dat do an",
        "dat do di cho", "mua do an toi nay"],
    must: ["winmart", "gio", "cho", "do an"],
    w: 2,
    reply: "Giỏ quen của nhà mình Mai gom sẵn rồi, Supra giao trong hai tiếng. Anh xem lại rồi chốt.",
    src: "giỏ quen WinMart+",
    flow: "cart",
    cta: "Mở giỏ",
    chips: ["Tối nay nấu gì nhanh?", "Điểm WinX được bao nhiêu?", "Mua sữa cho Bin"],
  },
  {
    id: "any_strange_calls",
    k: ["co cuoc goi la nao khong", "cuoc goi la nao khong", "cuoc goi la", "co ai goi khong",
        "ai goi cho toi", "so la goi", "co cuoc goi nao khong", "ai vua goi"],
    must: ["goi"],
    not: ["goi mon", "goi do"],
    w: 2,
    reply: "Sáng nay có một số lạ xưng là trường gọi xin đóng tiền, Mai chặn và không đổ chuông. Anh xem lại Mai lọc thế nào nhé.",
    src: "nhật ký chặn gọi",
    flow: "call",
    cta: "Xem Mai chặn cuộc gọi",
    chips: ["Trường gọi xin tiền có thật không?", "Mai lọc cuộc gọi kiểu gì?", "Hôm nay còn việc gì gấp?"],
  },
];

// ————— vòng hai · những câu khán giả hỏi mà tác giả quên —————
// Danh sách này đến từ một lượt soát đối kháng: mỗi mục là một câu
// người Việt xem demo sẽ gõ, mà trước đó rơi thẳng vào câu đỡ.
const PACK_GAPS2 = [
  {
    id: "todo_left",
    k: ["con gi phai lam khong", "con viec gi nua khong", "con gi nua khong", "con phai lam gi nua",
        "con viec gi khong", "het viec chua", "xong chua", "con gi nua"],
    must: ["con", "het viec", "xong"],
    reply: "Còn hai việc: học bơi 850.000đ hạn 17:00 và chốt người đón Bin lúc 16:30. Xong hai cái đó là chiều nay sạch.",
    src: "Nhà mình · hôm nay",
    goto: "family",
    cta: "Mở việc hôm nay",
    chips: ["Trả học bơi cho Bin", "Ai đón Bin chiều nay?", "Tuần sau có gì?"],
  },
  {
    id: "call_someone",
    k: ["goi cho vy", "goi vy", "goi cho ba", "goi co lan", "goi cho co lan", "goi giup anh",
        "goi dien cho vy", "bam so cho anh", "goi cho na"],
    must: ["goi"],
    not: ["cuoc goi la", "lua dao", "ai goi"],
    w: 2,
    reply: "Mai gọi Vy cho anh ngay. Vy không bắt máy thì Mai nhắn lại vào Nhà mình để khỏi lỡ việc đón Bin.",
    goto: "family",
    gotoCta: "Mở Nhà mình",
    chips: ["Nhắn Vy là anh về trễ", "Ai đón Bin chiều nay?", "Vy đang làm gì?"],
  },
  {
    id: "message_family",
    k: ["nhan vy", "nhan cho vy", "bao vy giup anh", "nhan la anh ve tre", "nhan vy la anh ve tre",
        "bao ca nha", "nhan vao nha minh", "soan tin cho vy"],
    must: ["nhan", "bao"],
    w: 2,
    reply: "Mai soạn sẵn tin cho Vy trong Nhà mình, anh xem rồi gửi. Anh cho Mai giờ về thì Mai ghi vào luôn.",
    goto: "family",
    gotoCta: "Mở Nhà mình",
    chips: ["Gọi cho Vy", "Ai đón Bin chiều nay?", "Hôm nay còn việc gì gấp?"],
  },
  {
    id: "tonight_time",
    k: ["toi nay may gio", "may gio toi nay", "toi nay luc may gio", "toi nay bat dau may gio"],
    must: ["toi nay"],
    reply: "Tập cuối Anh Trai Say Hi 20:00, Supra giao đồ ăn trước 18:00. Bây giờ 15:42 nên anh còn dư giờ.",
    src: "lịch tối nay",
    chips: ["Tối nay nhà mình xem gì?", "Tối nay nấu gì nhanh?", "Mở loa nhà Bà"],
  },
  {
    id: "na_where_now",
    k: ["na dang o dau", "na dau roi", "na dang lam gi", "na ve chua", "na tan hoc chua"],
    must: ["na"],
    w: 2,
    reply: "Na đang ở THCS Trần Phú, lớp 6A2, chiều nay không có tiết ngoại khoá. Bé tự về như mọi hôm nên anh không phải lo.",
    src: "lịch của Na",
    chips: ["Na mấy giờ tan học?", "Đơn dã ngoại của Na ký chưa?", "Na học lớp mấy?"],
  },
  {
    id: "na_pickup",
    k: ["na may gio tan hoc", "co phai don na nua khong", "don na khong", "na co can don khong",
        "ai don na", "na tan hoc luc may gio"],
    must: ["na"],
    w: 2,
    reply: "Na tự về được, chiều nay chỉ mình Bin cần người đón lúc 16:30. Anh chốt người đón Bin là xong việc chiều nay.",
    src: "lịch của Na",
    flow: "pickup",
    cta: "Chốt người đón Bin",
    chips: ["Na đang ở đâu?", "Ai đón Bin chiều nay?", "Hôm nay còn việc gì gấp?"],
  },
  {
    id: "my_calendar",
    k: ["anh co hop gi khong", "hop luc nao", "lich cua anh hom nay", "lich cua anh", "anh co lich gi",
        "hop den may gio", "anh ban gi hom nay", "lich hop cua anh"],
    must: ["hop", "lich cua anh"],
    not: ["phu huynh"],
    w: 2,
    reply: "Anh họp khách Q7 từ 16:00 tới 17:00, sau đó lịch trống. Bin tan bơi 16:30 nên hai cái chồng lên nhau.",
    src: "lịch của anh",
    flow: "pickup",
    cta: "Xem ai đón được",
    chips: ["Ai đón Bin chiều nay?", "Tối nay mấy giờ?", "Tuần sau có gì?"],
  },
  {
    id: "next_week",
    k: ["tuan sau co gi", "ngay kia co gi", "tuan toi co gi", "tuan sau the nao", "tuan sau ban gi"],
    must: ["tuan sau", "tuan toi", "ngay kia"],
    reply: "Tuần sau lớp bơi về lại thứ Ba và thứ Năm 16:30, chưa có việc nào khác. Họp phụ huynh của Na thì 15/08.",
    src: "lịch nhà mình",
    chips: ["Tuần này có gì?", "Na họp phụ huynh hôm nào?", "Đăng kiểm xe khi nào?"],
  },
  {
    id: "speaker_ba",
    k: ["mo loa nha ba", "loa nha ba", "chieu qua loa nha ba", "loa cua ba", "phat qua loa nha ba", "mo loa", "loa m ai lam duoc gi", "loa lam duoc gi", "loa m ai la gi"],
    must: ["loa"],
    w: 2,
    reply: "Mai mở loa nhà Bà được, Bà nghe rõ mà không phải bấm gì. Anh muốn Mai phát tập cuối 20:00 hay gọi cho Bà trước ạ?",
    flow: "speaker",
    cta: "Mở loa nhà Bà",
    chips: ["Giỗ Ông hôm nào?", "Mua quà gì cho Bà?", "Tối nay mấy giờ?"],
  },
  {
    id: "gio_prep",
    k: ["gio ong can chuan bi gi", "cung gio can chuan bi gi", "mang gi ve gio ong", "chuan bi gi cho gio ong",
        "gio ong chuan bi gi", "gio ong thu bay chuan bi gi", "can mang gi ve gio"],
    must: ["gio"],
    w: 3,
    reply: "Cô Út lo mâm cỗ và đặt xe rồi, phần nhà mình là hộp trà sen Phúc Long 165.000đ cho Bà. Đặt hôm nay thì Supra giao kịp thứ Sáu.",
    src: "Ông bà & cô chú",
    goto: "ongba",
    cta: "Mở nhóm Ông bà",
    chips: ["Trà sen cho Bà bao nhiêu?", "Giỗ Ông hôm nào?", "Tuần này có gì?"],
  },
  {
    id: "co_hong_who",
    k: ["co hong la ai", "co hong", "chu nhiem cua na la ai", "giao vien cua na la ai"],
    must: ["hong", "chu nhiem"],
    reply: "Cô Hồng chủ nhiệm lớp 6A2 của Na, email dã ngoại Cần Giờ là cô gửi. Anh ký đơn xong Mai gửi thẳng cho cô.",
    src: "hồ sơ của Na",
    flow: "form",
    cta: "Ký đơn cho Na",
    chips: ["Đơn dã ngoại của Na ký chưa?", "Na họp phụ huynh hôm nào?", "Na học lớp mấy?"],
  },
  {
    id: "cancel_undo",
    k: ["huy di", "anh doi y", "lam lai gium anh", "huy giup anh", "dung lai", "bo di", "khong lam nua", "huy", "dung co mua", "khong mua nua", "thoi khong mua"],
    must: ["huy", "doi y", "lam lai", "dung lai", "khong lam nua", "dung co mua", "khong mua nua"],
    w: 3,
    reply: "Mai dừng ở đây, chưa trừ đồng nào của anh cả. Anh muốn làm lại thì nói Mai một tiếng.",
    chips: ["Hôm nay còn việc gì gấp?", "Số dư còn bao nhiêu?", "Còn gì phải làm không?"],
  },
  {
    id: "clarify",
    k: ["khong hieu", "noi ro hon di", "noi lai di", "y la sao", "giai thich di", "noi gon lai di", "sao co"],
    must: ["hieu", "noi ro", "noi lai", "giai thich", "noi gon", "y la sao"],
    w: 2,
    reply: "Mai nói gọn lại: học bơi của Bin 850.000đ, hạn 17:00 chiều nay. Anh muốn trả luôn thì Mai mở sẵn.",
    flow: "pay",
    cta: "Trả học bơi",
    chips: ["Ai đón Bin chiều nay?", "Hôm nay còn việc gì gấp?", "Mai làm được gì?"],
  },
  {
    id: "other_bills",
    k: ["tien nha thang nay", "internet thang nay bao nhieu", "tien internet", "tien nha bao nhieu",
        "tien nuoc thang nay", "hoa don khac"],
    must: ["tien nha", "internet", "tien nuoc", "hoa don khac"],
    reply: "Nhà mình mới nối hoá đơn điện và học phí thôi, tiền nhà với internet Mai chưa có. Anh chụp hoá đơn gửi Mai là từ kỳ sau Mai theo giúp.",
    src: "hồ sơ chi tiêu",
    files: true,
    chips: ["Điện tháng 7 trả chưa?", "Tôi nợ gì tuần này?", "Số dư còn bao nhiêu?"],
  },
  {
    id: "overdue_what_then",
    k: ["qua han thi sao", "tre han thi sao", "neu qua han thi sao", "qua han co sao khong", "de qua han thi sao"],
    must: ["qua han", "tre han"],
    w: 2,
    reply: "Quá hạn đăng kiểm phạt 4 tới 6.000.000đ, mà có chuyện thì bảo hiểm cũng không đền. Còn 37 ngày, anh đặt sớm cho chắc.",
    src: "hồ sơ xe",
    flow: "inspect",
    cta: "Đặt lịch đăng kiểm",
    chips: ["Đăng kiểm cần mang giấy gì?", "Phí đăng kiểm bao nhiêu?", "Đi trung tâm nào cho nhanh?"],
  },
  {
    id: "whose_number",
    k: ["so nay la ai", "ai vua goi", "so la nao vua goi", "so nay cua ai", "ai goi ban nay"],
    must: ["so nay", "ai vua goi", "so la nao"],
    w: 2,
    reply: "Một số lạ xưng là trường gọi xin đóng tiền, Mai giữ lại chờ anh xem chứ không cho đổ chuông. Ngoài cuộc đó thì chiều nay không ai gọi.",
    src: "nhật ký chặn gọi",
    flow: "call",
    cta: "Xem Mai chặn cuộc gọi",
    chips: ["Trường gọi xin tiền có thật không?", "Mai lọc cuộc gọi kiểu gì?", "Có cuộc gọi lạ nào không?"],
  },
];


// ————— vá theo phản hồi ba người dùng thử (Phủ Lý 57 · Thái Nguyên 63 · Vinh 48) —————
const PACK_AUNTY = [
  {
    id: "demo_whoami",
    k: ["sao goi toi la anh", "sao cu goi toi la anh", "toi la ba noi ma", "toi la ba ngoai ma", "toi la co ma", "toi khong phai anh",
        "bin la dua nao", "bin la ai", "na la ai", "vy la ai", "day la may cua ai", "nha ai day", "app cua ai day", "chau toi ten khac ma"],
    w: 2,
    reply: "Đây là bản xem thử, kể chuyện nhà anh Hải: anh Hải, chị Vy, bé Bin và bé Na. Mai gọi “anh” là gọi anh Hải, không phải gọi người đang xem.",
    src: "bản xem thử",
    chips: ["Mai làm được gì?", "Ai đọc được tin nhắn của tôi?", "Bấm nhầm có mất tiền không?"],
  },
  {
    id: "transfer_money",
    k: ["chuyen tien", "chuyen khoan", "gui tien", "chuyen tien cho con", "gui tien cho con", "chuyen tien cho chau", "gui tien ve que",
        "chuyen khoa cho chau", "chuyen khoa", "chuyen 2 trieu", "gui cho con gai"],
    must: ["chuyen", "gui"],
    not: ["gia danh", "lua dao", "bi lua", "chan cuoc goi"],
    reply: "Mai chuyển được qua WinMoney cho người trong danh bạ đã định danh CCCD, không mất phí, quét mặt xong tiền mới đi. Anh nói tên người nhận và số tiền là Mai soạn sẵn.",
    src: "ví WinMoney",
    chips: ["Số dư còn bao nhiêu?", "Bấm nhầm có mất tiền không?", "Mai làm được gì?"],
  },
  {
    id: "tap_safety",
    k: ["bam nham co mat tien", "bam nham co bi tru tien", "bam vao day co bi mat tien", "bam vao co mat tien", "bam nham thi sao",
        "lo bam nham", "so bam nham", "co bi mat tien khong", "bam nham mot phat"],
    w: 2,
    reply: "Không mất đâu. Đây là bản xem thử, tiền trong này không phải tiền thật. Dùng thật thì chưa quét mặt là chưa mất đồng nào, lỡ tay thì hoàn lại trong 24 giờ.",
    src: "bản xem thử",
    flow: "wallet",
    cta: "Đặt trần cho Mai",
    chips: ["Đặt trần cho Mai tiêu tới đâu?", "Số dư còn bao nhiêu?", "Mai làm được gì?"],
  },
  {
    id: "med_reminder",
    k: ["nhac toi uong thuoc", "nhac uong thuoc", "thuoc huyet ap", "dat nhac uong thuoc", "nhac gio uong thuoc", "uong thuoc luc"],
    reply: "Dạ, Mai nhắc lúc 20:00 mỗi tối, tới giờ Mai gọi cả trên loa. Thuốc huyết áp nên uống đều một giờ cố định, còn uống trước hay sau ăn thì anh hỏi bác sĩ cho chắc.",
    chips: ["Hôm nay còn việc gì gấp?", "Mai làm được gì?", "Có cuộc gọi lạ nào không?"],
  },
  {
    id: "market_price",
    k: ["gia thit heo", "gia thit lon", "thit heo bao nhieu", "thit lon hom nay", "gia vang", "gia vang hom nay", "gia rau", "gia ca hom nay", "gia xang"],
    reply: "Giá chợ ngoài với giá vàng Mai chưa xem được, Mai nói thật. Trong WinMart+ thì ba rọi MEATDeli 500g đang 92.000đ, anh cần Mai bỏ vào giỏ không?",
    flow: "cart",
    cta: "Xem giỏ",
    chips: ["Mua ngoài chợ có rẻ hơn không?", "Giỏ hàng bao nhiêu tiền?", "Tối nay nấu gì nhanh?"],
  },
  {
    id: "ship_fee",
    k: ["phi ship", "phi giao hang", "ship bao nhieu", "giao hang mat phi", "tien ship", "phi van chuyen", "mat phi giao khong"],
    reply: "Đơn WinMart+ từ 100.000đ thì Supra giao không tính phí, dưới mức đó phí 15.000đ. Giỏ hôm nay 186.000đ nên miễn phí.",
    src: "WinMart+ · Supra",
    chips: ["Giỏ hàng bao nhiêu tiền?", "Khi nào giao?", "Đơn này được bao nhiêu điểm WinX?"],
  },
  {
    id: "haggle",
    k: ["dat qua", "giam gia duoc khong", "bot duoc khong", "giam duoc khong", "co khuyen mai khong", "co giam gia khong", "sao dat the", "bot chut di"],
    reply: "Giá WinMart+ là giá niêm yết, Mai không mặc cả được, nhưng món nào đang khuyến mãi Mai luôn chọn trước. Anh muốn Mai đổi món nào rẻ hơn trong giỏ không?",
    flow: "cart",
    cta: "Xem giỏ",
    chips: ["Mua ngoài chợ có rẻ hơn không?", "Giỏ hàng bao nhiêu tiền?", "Đơn này được bao nhiêu điểm WinX?"],
  },
  {
    id: "winmoney_what",
    k: ["winmoney la gi", "winmoney la cai gi", "winmoney co phai tien that", "winmoney", "vi winmoney la gi"],
    reply: "WinMoney là ví tiền thật, nối thẳng tài khoản Techcombank của anh, trả ở WinMart+, Phúc Long hay chuyển cho người nhà đều được. Chưa quét mặt là chưa mất đồng nào.",
    src: "ví WinMoney",
    flow: "wallet",
    cta: "Mở ví",
    chips: ["Số dư còn bao nhiêu?", "Bấm nhầm có mất tiền không?", "Trả bằng gì thì rẻ nhất?"],
  },
  {
    id: "font_bigger",
    k: ["chu to len", "chu nho qua", "khong thay ro chu", "doc to len", "to chu len", "phong chu to", "chu be qua"],
    reply: "Dạ, bản dùng thật chỉnh được cỡ chữ to lên và Mai đọc to mọi tin cho anh nghe được. Bản xem thử này Mai chưa gắn nút đó, Mai nói thật.",
    src: "bản xem thử",
    chips: ["Loa m.ai làm được gì?", "Mai làm được gì?", "Hôm nay còn việc gì gấp?"],
  },
  {
    id: "data_delete",
    k: ["xoa het thong tin", "xoa du lieu cua toi", "xoa tai khoan", "xoa het thong tin cua toi", "xoa het di", "xoa sach di"],
    must: ["xoa"],
    reply: "Hồ sơ nhà mình nằm ngay trên máy anh, muốn xoá là xoá sạch tại chỗ, Mai không giữ bản nào ở nơi khác. Anh nói xoá là Mai xoá, không hỏi vòng vo.",
    src: "hồ sơ nhà mình",
    chips: ["Ai đọc được tin nhắn của tôi?", "Mai lưu những gì của nhà mình?", "Mai làm được gì?"],
  },
  {
    id: "spend_cap",
    k: ["dat tran", "dat tran cho mai", "tran chi tieu", "gioi han chi tieu", "mai duoc tieu bao nhieu", "mai tu tra bao nhieu",
        "dat tran cho mai tieu toi dau", "gioi han cho mai", "mai tieu toi dau", "khong cho mai tu tra"],
    w: 2,
    reply: "Anh đặt trần thì dưới mức đó Mai tự trả rồi báo lại, trên mức đó Mai dừng lại hỏi anh. Người nhận lạ thì Mai vẫn hỏi, dù số tiền nhỏ.",
    src: "ví WinMoney",
    flow: "wallet",
    cta: "Đặt trần cho Mai",
    chips: ["Bấm nhầm có mất tiền không?", "Số dư còn bao nhiêu?", "Tháng này Mai trả hộ những gì?"],
  },
  {
    id: "wallet_spent",
    k: ["thang nay mai tieu gi", "mai tieu gi", "da tra nhung gi", "chi tieu thang nay", "xem chi tieu", "mai tra ho nhung gi", "so chi tieu"],
    reply: "Mọi khoản Mai trả hộ đều ghi trong ví, mở ra là thấy từng dòng kèm biên lai. Không có khoản nào Mai giấu anh cả.",
    src: "ví WinMoney",
    flow: "wallet",
    cta: "Mở ví",
    chips: ["Đặt trần cho Mai tiêu tới đâu?", "Số dư còn bao nhiêu?", "Sắp tới phải trả gì?"],
  },
  {
    id: "upcoming_bills",
    k: ["sap toi phai tra gi", "sap toi tra gi", "con phai tra gi", "khoan nao sap den han", "sap den han", "thang toi tra gi"],
    reply: "Phí dã ngoại của Na 120.000đ hạn thứ Sáu, đăng kiểm 340.000đ ngày 12/09, điện tháng 8 khoảng 1.240.000đ đầu tháng sau. Cộng chừng 1.700.000đ trong năm tuần.",
    src: "ví WinMoney",
    flow: "wallet",
    cta: "Mở ví",
    chips: ["Số dư còn bao nhiêu?", "Đặt trần cho Mai tiêu tới đâu?", "Đơn dã ngoại của Na"],
  },
  {
    id: "dangkiem_moto",
    k: ["xe may co can dang kiem", "dang kiem xe may", "xe may khong can dang kiem", "xe may can dang kiem", "di xe may co can dang kiem"],
    must: ["xe may"],
    w: 2,
    reply: "Xe máy thì không phải đăng kiểm định kỳ anh, chỉ ô tô mới cần. Mazda nhà mình hạn 12/09, Mai đang canh sẵn.",
    src: "hồ sơ xe",
    chips: ["Đặt lịch đăng kiểm xe", "Quá hạn đăng kiểm phạt bao nhiêu?", "Mai làm được gì?"],
  },
  {
    id: "vs_shopee",
    k: ["shopee re hon", "re hon shopee", "freeship", "sao khong mua shopee", "shopee"],
    w: 2,
    reply: "Đồ khô trên Shopee nhiều khi rẻ hơn thật, Mai không giấu anh. Chỗ Mai hơn là đồ tươi giao trong hai tiếng, tiền và giấy tờ của nhà nằm chung một chỗ, không phải chờ đợt giảm giá.",
    chips: ["Mua ngoài chợ có rẻ hơn không?", "Phí ship bao nhiêu?", "Mai làm được gì?"],
  },
  {
    id: "livestream_fake",
    k: ["mua hang tren livestream", "livestream", "mua phai hang gia", "hang gia", "hang that hang gia", "biet hang that"],
    w: 2,
    reply: "Trong kênh mặt thật, người bán có định danh CCCD, tiền được giữ hộ tới khi hàng về đúng tên anh mới chuyển cho họ. Livestream bên ngoài thì Mai chưa kiểm được, anh đừng chuyển cọc trước.",
    src: "kênh mặt thật",
    chips: ["Mua vé lại có bị lừa không?", "Có cuộc gọi lạ nào không?", "Mai làm được gì?"],
  },
  {
    id: "send_media_call",
    k: ["gui cai anh nay", "gui anh cho", "gui anh gium", "goi video", "goi video cho", "goi dien cho"],
    must: ["gui anh", "gui cai anh", "goi video", "goi dien"],
    reply: "Trong nhóm Nhà mình, anh chạm máy ảnh cạnh ô nhắn là gửi được ảnh, gọi video thì chạm ống nghe góc phải. Mai gửi kèm lời nhắn giúp anh được.",
    chips: ["Mai làm được gì?", "Hôm nay còn việc gì gấp?", "Có cuộc gọi lạ nào không?"],
  },
]; 

export const MAI_INTENTS = [].concat(PACK_MONEY, PACK_KIDS, PACK_DOCS, PACK_SHOP, PACK_LIFE, PACK_GAPS, PACK_GAPS2, PACK_AUNTY);

// "Đăng kiểm xe?" → "dang kiem xe"
// Viết tắt kiểu chợ: mở rộng theo TỪ sau khi gấp dấu, "186k" giữ nguyên.
const ABBR = {
  bnhieu: "bao nhieu", bnhiu: "bao nhieu", bn: "bao nhieu",
  ko: "khong", kh: "khong", k: "khong", hok: "khong", hong: "khong",
  dc: "duoc", đc: "duoc", ck: "chuyen khoan", j: "gi", ntn: "nhu the nao",
  sdt: "so dien thoai", dt: "dien thoai", vs: "voi",
};
export const fold = (s) =>
  (s || "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((w) => ABBR[w] || w)
    .join(" ");

// So khớp theo ranh giới từ: "gio" không được dính vào "giong".
const has = (padded, p) => padded.indexOf(" " + p + " ") !== -1;

// Cụm dài thắng cụm ngắn: "hoc boi bao nhieu" phải hơn mỗi "boi".
const scoreIntent = (padded, it) => {
  if (it.not && it.not.some((n) => has(padded, n))) return 0;
  if (it.must && !it.must.some((m) => has(padded, m))) return 0;
  let s = 0;
  for (const p of it.k) if (p && has(padded, p)) { const n = p.split(" ").length; s += 10 * n * n; }
  return s ? s * (it.w || 1) : 0;
};

// "ừ", "ok", "làm đi" — bám vào việc vừa nói.
const YES = /^(u|uh|um|ukm|uk|ok|oke|okie|okay|dung|dung roi|co|duoc|duoc anh|di|lam di|lam luon|lam di mai|chot|chot di|chot luon|di anh|vay di|the di|yes)$/;
const NO = /^(thoi|thoi khoi|khong|ko|k|kh|khong can|de sau|de anh tinh|bo qua|khoi|no)$/;

export const matchMai = (raw, ctx) => {
  const q = fold(raw);
  if (!q) return null;
  const padded = " " + q + " ";

  if (NO.test(q)) return { id: "_no", reply: "Dạ, Mai để nguyên. Anh cần thì gọi Mai bất cứ lúc nào.", chips: (ctx && ctx.chips) || null };
  if (YES.test(q)) {
    const prev = ctx && ctx.last;
    if (prev && (prev.flow || prev.action))
      return { id: prev.id + "_yes", reply: prev.yes || "Vâng anh, Mai mở luôn.", flow: prev.flow, cta: prev.cta || "Mở", action: prev.action, chips: prev.chips };
    return { id: "_yes_bare", reply: "Anh muốn Mai làm việc nào trước ạ?", chips: null };
  }

  let best = null, bestScore = 0;
  for (const it of MAI_INTENTS) {
    const s = scoreIntent(padded, it);
    if (s > bestScore) { bestScore = s; best = it; }
  }
  return best && bestScore >= 10 ? best : null;
};

// Không khớp thì vẫn phải dẫn anh đi đâu đó.
export const pickFallback = (n) => FALLBACKS[Math.abs(n) % FALLBACKS.length];
