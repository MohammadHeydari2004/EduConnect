<div dir="rtl">

# 🎓 EduConnect | سامانه جامع مدیریت و ارتباطات آموزشی

---

## 📖 معرفی و چشم‌انداز پروژه

**EduConnect**
یک پلتفرم یکپارچه، تحت وب و مبتنی بر نقش (Role-Based) برای مدیریت فرآیندهای آموزشی، ارتباطی و نظارتی میان **دانشجویان، اساتید و مدیران گروه** است. این سامانه با هدف شبیه‌سازی یک محیط واقعی دانشگاهی (LMS) طراحی شده و معماری آن بر پایه تفکیک دقیق دغدغه‌ها (Separation of Concerns)، توسعه مبتنی بر وابستگی (Dependency-Driven Development) و الگوهای مدرن مدیریت حالت (State Management) استوار است.

هدف غایی این پروژه، ارائه یک راهکار نرم‌افزاری چابک برای پوشش نیازهای آموزشی، مدیریت کلاس‌ها، رصد حضور و غیاب، چرخه حیات تکالیف و ارائه داشبوردهای تحلیلی اختصاصی است.

> در نسخه **3.7.0** تمرکز اصلی، ارتقای کیفیت معماری و قابل‌استفاده‌مجددشدن اجزا بوده است: استخراج هوک‌های مشترک، متمرکزسازی آیکون‌ها/تنظیمات/نمودارها، تفکیک ماژول حضور و غیاب به نمای‌های نقش‌محور و افزودن امکاناتی مانند **کلاس‌های منِ دانشجو**، **گزارش حضورِ مدیر** و **تقویم جلالی**.

</div>

---

<div dir="rtl">

## ✨ ویژگی‌های کلیدی و ماژول‌های پیاده‌سازی شده

### 🛡 مدیریت هویت و دسترسی‌ها (IAM & RBAC)

- **احراز هویت امن:** شبیه‌سازی ورود و خروج با استفاده از Context API و LocalStorage (بدون ذخیره رمز عبور در کلاینت).
- **کنترل دسترسی مبتنی بر نقش:** محافظت از مسیرها (Protected Routes) و کامپوننت‌ها (Role Guards) برای سه نقش کلیدی: `Admin` (مدیر گروه)، `Teacher` (استاد) و `Student` (دانشجو) — با آرایه‌های متمرکز نقش (`ALL_ROLES`, `ADMIN_ROLES`, `TEACHER_AND_ABOVE_ROLES`, `TEACHER_AND_STUDENT_ROLES`) در `configs/constants.ts`.
- **مدیریت چرخه حیات کاربران:** ایجاد، ویرایش، تعلیق (Suspend) و تغییر نقش کاربران توسط مدیر سیستم.
- **محافظت از آخرین مدیر:** جلوگیری از حذف یا غیرفعال‌سازی آخرین کاربر با نقش `admin` (و آخرین مدیر فعال).
- **اعتبارسنجی ایمیل یکتا:** جلوگیری از ثبت ایمیل تکراری در سطح سرویس.
- **حذف آبشاری وابسته به کاربر:** حذف خودکار کلاس‌ها، حضور و غیاب، پاسخ‌ها و اطلاعیه‌های متعلق به کاربر + پاک‌سازی دانشجو از فهرست دانشجویان کلاس‌ها هنگام حذف حساب.
- **حالت فقط‌خواندنی عمیق:** استفاده از `Readonly<AuthContextType>` برای جلوگیری از تغییر ناخواسته حالت احراز هویت.
- **اعتبارسنجی ساختار کاربر:** تابع `isValidUser` (در `utils/guards.ts`) برای صحت داده‌های بازیابی‌شده از `localStorage`.
- **جداسازی رمز عبور:** تایپ `User` (تمیز، بدون رمز) از `UserWithPassword` جدا شده و تابع `removePassword` قبل از ذخیره، رمز را حذف می‌کند.

### 🏛 مدیریت آموزشی (Academic Management)

- **مدیریت کلاس‌ها و جلسات:** تعریف دوره‌ها، تخصیص ظرفیت، انتصاب استاد و زمان‌بندی جلسات آموزشی.
- **صفحه «کلاس‌های من» برای دانشجو:** `StudentClassesPage` نمایش کلاس‌های ثبت‌نام‌شده با نشانگر رنگی ظرفیت و وضعیت؛ همراه با صفحه جای‌نگشت `JoinClassPlaceholderPage` (ثبت‌نام در کلاس، در حال توسعه).
- **انتخاب دانشجویان پیشرفته:** کامپوننت مستقل `SearchableMultiSelect` با قابلیت جستجو، انتخاب گروهی، انتخاب نتایج فیلترشده، چیپ (Chip)، **ناوبری کامل با کیبورد** (فلش‌ها، Home/End، Enter/Space، Escape) و **تفکیک به ۶ زیرکامپوننت** (`MultiSelectTrigger`, `MultiSelectDropdown`, `MultiSelectOption`, `MultiSelectActions`, `MultiSelectEmpty`, `MultiSelectTypes`).
- **سیستم حضور و غیاب نقش‌محور:** ماژول حضور و غیاب به **ارکستراتور** `AttendancePage` و سه نمای مستقل تفکیک شده است: `TeacherAttendanceForm` (ثبت استاد + عملیات گروهی «حاضر/غایب کردن همه»)، `StudentAttendanceView` (آمار و درصد حضور دانشجو) و **`AdminAttendanceReport` (گزارش فقط‌مطالعه برای مدیر با انتخاب آزاد کلاس/جلسه)**.
- **تقویم جلالی (تاریخ شمسی):** کامپوننت `DatePicker` با تقویم کامل شمسی و تبدیل دوطرفه میلادی↔شمسی؛ استفاده‌شده برای تعیین ددلاین تکالیف.
- **چرخه حیات تکالیف (Assignments):** تعریف تکلیف، تعیین مهلت با `DatePicker`، ارسال پاسخ توسط دانشجو و فرآیند نمره‌دهی (۰ تا ۲۰) و بازخورد توسط استاد — با جدول استخراج‌شده `AssignmentsTable` و هوک داده `useAssignmentsPageData`.
- **مدیریت جلسات کلاس:** ایجاد/ویرایش/حذف جلسات با عنوان، تاریخ و توضیحات + لینک مستقیم به حضور و غیاب هر جلسه.
- **حالت نمایش پاسخ پس از ددلاین:** مشاهده و کپی پاسخ ارسالی بدون امکان ویرایش.
- **آپدیت موضعی (Optimistic Update):** تغییرات در لیست کلاس‌ها، تکالیف، اطلاعیه‌ها و ارسال‌ها به‌صورت موضعی اعمال می‌شوند و نیازی به واکشی مجدد از سرور نیست.

### 📢 سیستم اطلاعیه‌ها (Announcements)

- انتشار اطلاعیه‌های عمومی (Global) یا هدفمند (Targeted).
- تعیین مخاطب بر اساس کلاس، نقش یا ترکیب هر دو (با ثابت‌های `GLOBAL_ANNOUNCEMENT_CLASS_ID` و `DEFAULT_TARGET_ROLES`).
- منطق نمایش متمرکز: تابع `isAnnouncementVisibleTo` (در `utils/announcementVisibility.ts`) در `useFilteredAnnouncements` با فیلترهای نویسنده/کلاس/نقش/وضعیت‌خوانده.
- قابلیت رهگیری وضعیت مشاهده (Seen/Unseen) برای هر کاربر + بازنشانی وضعیت مشاهده پس از ویرایش.
- نشانگر بصری اطلاعیه‌های خوانده‌نشده (نقطه آبی + برچسب «جدید»).

### 📊 داشبوردهای تحلیلی و آماری (Analytics Dashboards)

- **داشبورد مدیر:** نظارت بر آمار کلان سامانه، توزیع نقش‌ها (نمودار دایره‌ای) و آخرین کلاس‌های ثبت‌شده.
- **داشبورد استاد:** رصد تکالیف نیازمند تصحیح (نمودار میله‌ای افقی با حالت موبایلِ کارت‌محور)، وضعیت حضور کلاس‌ها و جلسات اخیر.
- **داشبورد دانشجو:** نمایش درصد حضور (نمودار دایره‌ای)، تکالیف نزدیک ددلاین و اطلاعیه‌های مرتبط.
- **تفکیک داده داشبورد:** محاسبه داده از کامپوننت‌ها خارج و به `utils/dashboardData.ts` (هوک‌های `useTeacherDashboardData`, `useStudentDashboardData`, `useGradingStats`, `useRecentSessions`, `useChartSummary`) و تایپ `DashboardData`/`EMPTY_DASHBOARD_DATA` در `types/dashboard.ts` منتقل شده است.
- **کامپوننت‌های نمودار قابل اشتراک:** `ChartTooltip` و `ChartLegend` با تایپ مشترک `ChartPayloadEntry` جایگزین تولتیپ/لیجندِ درون‌صفحه‌ای هر داشبورد شده‌اند + پالت رنگی متمرکز `CHART_COLORS`.
- **واکشی نقش‌محور:** `DashboardContainer` با هوک `useAsyncData` فقط داده‌های مورد نیاز هر نقش را واکشی می‌کند (جلوگیری از Over-fetching).

### 🎨 تجربه کاربری و رابط کاربری (UX/UI)

- **طراحی کاملاً ریسپانسیو:** پشتیبانی از موبایل، تبلت و دسکتاپ با هوک `useMediaQuery`/`useIsMobile`.
- **کارت‌های موبایل:** نمایش داده‌ها به‌صورت کارت در صفحات کوچک به‌جای جدول (با `renderMobileCard`/`renderMobileActions` در `Table`).
- **منوی اکشن هوشمند:** `ActionsMenu` و `MenuItem` با رندر `createPortal` و موقعیت‌یابی خودکار (جلوگیری از بیرون رفتن از صفحه).
- **سیستم نوتیفیکیشن (Toast):** بازخورد لحظه‌ای با `ToastContext`/`ToastProvider` و **سقف `MAX_TOASTS = 5`**.
- **مدال‌های بهینه:** بستن با Escape، کلیک خارج، مدیریت اسکرول، رندر با `createPortal` و **Focus Trap کامل** (`Tab`/`Shift+Tab`).
- **مدیریت خطای پیشرفته:** `react-error-boundary` با `ErrorBoundaryWrapper`/`RouterErrorBoundary` و پشتیبانی `resetKeys` + **صفحه خطای پایه** `ErrorPage` (که `NotFound` و `Unauthorized` از آن بهره می‌برند) و `ErrorAlert` برای خطاهای داده.
- **اسکرول به بالا:** `ScrollToTop` اسکرول نرمِ محدوده‌ی محتوای اصلی (نه کل صفحه) در تغییر مسیر.
- **لینک پرش به محتوا:** دسترسی‌پذیری بهتر با لینک «پرش به محتوای اصلی» + `buildAriaDescribedBy` در `utils/accessibility.ts`.
- **آیکون‌های متمرکز:** ۳۰+ آیکون SVG در یک فایل مشترک `components/common/icons.tsx` (قابل اشتراک‌گذاری و بدون تکرار).
- **فونت فارسی وزیرمتن:** پشتیبانی کامل از زبان فارسی و جهت‌گیری RTL (پیکربندی با `@theme` در `index.css` برای Tailwind v4).
- **فرم‌های هوشمند:** مدیریت فرم‌ها با کنترل‌های state + اعتبارسنجی مشترک از طریق `validateTitle`، `validation.ts` و الگوی یکپارچه در همه فرم‌ها.
- **نشانگر ظرفیت رنگی:** نمایش وضعیت ظرفیت کلاس‌ها با رنگ‌های سبز/زرد/قرمز بر اساس آستانه‌های `CAPACITY_THRESHOLDS`.
- **کامپوننت `UserDetailsList`:** نمایش یکپارچه جزئیات کاربر در مدال جزئیات (`UserDetails`) و صفحه پروفایل.

### 🔐 امنیت و پایداری

- **عدم ذخیره رمز عبور:** حذف `password` از شیء کاربر (با `removePassword`) قبل از ذخیره در `localStorage`.
- **اعتبارسنجی ساختار کاربر:** تابع `isValidUser` برای بررسی صحت داده‌های ذخیره‌شده.
- **مدیریت خطای شبکه:** کلاس ساختاریافته `ApiError` با `userMessage`، `status`، `code`، `url` و `serverData` + Type Guard `isApiError` + استخراج یکپارچه پیام با `getErrorMessage` (`utils/error.ts`).
- **پیام‌های اختصاصی خطا:** برای تایم‌اوت، عدم دسترسی به سرور، خطای سرور، ۴۰۱ و ۴۰۳ (با جدول `STATUS_MESSAGES`).
- **لاگر توسعه‌محور:** کلاس `Logger` (`utils/logger.ts`) برای لاگ درخواست/پاسخ/خطا فقط در محیط توسعه.
- **اینترسپتورهای Axios:** لاگ و مدیریت یکپارچه خطاها؛ تایم‌اوت از ثابت `API_REQUEST_TIMEOUT_MS`.
- **حذف آبشاری:** حذف خودکار جلسات، حضور و غیاب و تکالیف مرتبط هنگام حذف کلاس.
- **دسترس‌پذیری (A11y):** استفاده از `sr-only`، `aria-label`، `role` و `aria-live` در سراسر کامپوننت‌ها.

</div>

---

<div dir="rtl">

## 🛠 پشته تکنولوژی (Tech Stack)

| دسته‌بندی            | تکنولوژی‌ها و ابزارها                     | نسخه           |
| :------------------- | :---------------------------------------- | :------------- |
| **هسته فرانت‌اند**   | React, TypeScript (Strict Mode), Vite     | 19.3, 7.0, 8.3 |
| **طراحی و استایل**   | Tailwind CSS (v4، پیکربندی با `@theme`), Vazirmatn Font, RTL Support | 4.3 |
| **مسیریابی و State** | React Router DOM, React Context API       | 7.18           |
| **مدیریت فرم‌ها**    | React Hook Form, Custom Validators        | 7.88           |
| **لایه شبکه**        | Axios, Custom API Wrapper (baseApi)       | 1.20           |
| **مصورسازی داده**    | Recharts (با تولتیپ/لیجند قابل اشتراک)     | 3.10           |
| **مدیریت خطا**       | react-error-boundary                      | 6.1            |
| **تقویم جلالی**      | کامپوننت `DatePicker` اختصاصی (تاریخ شمسی) | —              |
| **سرور شبیه‌ساز**    | JSON Server (Mock REST API)               | 1.0            |
| **کیفیت کد**         | oxlint, Prettier, TypeScript Strict Mode  | —              |
| **متغیرهای محیطی**   | `.env` با پشتیبانی از `import.meta.env`   | —              |

</div>

---

<div dir="rtl">

## 📂 معماری و ساختار دایرکتوری‌ها

معماری پروژه به‌صورت ماژولار و مقیاس‌پذیر طراحی شده است تا توسعه و نگهداری آن در فازهای آتی تسهیل گردد:

</div>

```text
src/
├── components/
│   ├── common/          # کامپوننت‌های مشترک
│   │   ├── EmptyState.tsx              # حالت خالی با آیکون و اکشن
│   │   ├── ErrorBoundaryWrapper.tsx    # مدیریت خطا با react-error-boundary + Logger
│   │   ├── Header.tsx                  # هدر با دکمه منو، نشان نقش و خروج
│   │   ├── icons.tsx                   # ★ ۳۰+ آیکون SVG متمرکز و قابل اشتراک
│   │   ├── Loading.tsx                 # اسپینر (با استفاده از Spinner)
│   │   ├── RouterErrorBoundary.tsx     # مرز خطا بر اساس مسیر
│   │   ├── ScrollToTop.tsx             # اسکرول محدوده محتوا در تغییر مسیر
│   │   └── Sidebar.tsx                 # منو با آیکون + فیلتر نقش‌محور از navigation
│   └── ui/               # کامپوننت‌های پایه رابط کاربری
│       ├── ActionsMenu.tsx             # ★ منوی اکشن با پورتال و موقعیت‌یابی هوشمند
│       ├── Badge.tsx                   # نشان با رنگ‌بندی
│       ├── Button.tsx                  # ★ دکمه با variantهای success/danger-light
│       ├── Card.tsx                    # کارت با هدر و بدنه
│       ├── ChartLegend.tsx             # ★ لیجند قابل اشتراک نمودارها (Recharts)
│       ├── ChartTooltip.tsx            # ★ تولتیپ قابل اشتراک + تایپ ChartPayloadEntry
│       ├── ConfirmDialog.tsx           # دیالوگ تأیید با آیکون
│       ├── DatePicker.tsx            # ★ تقویم جلالی (تاریخ شمسی) با تبدیل دوطرفه
│       ├── ErrorAlert.tsx              # ★ هشدار ساده خطای داده
│       ├── Input.tsx                   # ورودی با لیبل، خطا و suffix
│       ├── MenuItem.tsx                # ★ آیتم منوی اکشن
│       ├── Modal.tsx                   # ★ مدال با پورتال، فوکوس‌ترپ و مدیریت اسکرول
│       ├── MultiSelectActions.tsx      # ★ اکشن‌های انتخاب همه/فیلتر/حذف همه
│       ├── MultiSelectDropdown.tsx     # ★ بدنه دراپ‌داون با پورتال و کیبورد
│       ├── MultiSelectEmpty.tsx        # ★ حالت خالی ریزالتهای جستجو
│       ├── MultiSelectOption.tsx       # ★ گزینه‌ی قابل انتخاب
│       ├── MultiSelectTrigger.tsx      # ★ ترگر با چیپ‌های انتخاب‌شده
│       ├── MultiSelectTypes.ts         # ★ تایپ‌های مشترک MultiSelect
│       ├── SearchableMultiSelect.tsx   # ★ انتخاب چندگانه با ناوبری کامل کیبورد
│       ├── SearchInput.tsx             # ورودی جستجو با آیکون
│       ├── Select.tsx                  # سلکت با فلش سفارشی + حالت compact
│       ├── Spinner.tsx                 # ★ اسپینر با سایزهای sm/md
│       ├── StatCard.tsx                # کارت آمار با قالب‌بندی فارسی
│       ├── StatusChip.tsx              # نشان وضعیت + برچسب‌های ATTENDANCE
│       ├── Table.tsx                   # ★ جدول با کارت/اکشن موبایل و موقعیت‌یابی هوشمند
│       ├── Textarea.tsx                # متن چندخطی
│       └── UserDetailsList.tsx         # ★ جزئیات کاربر قابل اشتراک (dl)
├── configs/             # تنظیمات سراسری و ثابت‌های محیطی
│   ├── constants.ts     # ★ کلیدهای ذخیره‌سازی + آرایه‌های نقش، آستانه‌ها، رنگ‌ها، حد نمره/ظرفیت
│   └── navigation.tsx   # ★ آیتم‌های منو (navItems) با فیلتر نقش‌محور
├── contexts/            # مدیریت Stateهای سراسری
│   ├── AuthContext.ts   # کانتکست احراز هویت + هوک useAuth
│   ├── AuthProvider.tsx # ★ فراهم‌کننده احراز هویت (Readonly + بازیابی با isValidUser)
│   ├── ToastContext.tsx # کانتکست نوتیفیکیشن
│   └── ToastProvider.tsx# ★ فراهم‌کننده نوتیفیکیشن با سقف MAX_TOASTS
├── hooks/               # ★ هوک‌های اختصاصی و قابل استفاده مجدد
│   ├── useAsyncData.ts  # ★ واکشی داده با loading/isRefreshing/error/refresh/setData
│   ├── useClickOutside.ts # ★ تشخیص کلیک خارج (برای دراپ‌داون‌ها)
│   ├── useMapById.ts    # ★ ساخت Map از آرایه بر اساس id (memoized)
│   ├── useMediaQuery.ts # ★ تشخیص رسانه + useIsMobile
│   ├── useModalState.ts # ★ مدیریت حالت مدال‌ها (kind + target)
│   └── useToast.ts      # هوک استفاده از نوتیفیکیشن
├── layouts/             # ساختارهای کلان صفحات
│   └── MainLayout.tsx   # ★ لایوت اصلی با مدیریت فوکوس/اسکرول و لینک پرش
├── pages/
│   ├── announcements/   # ماژول اطلاعیه‌ها
│   │   ├── AnnouncementForm.tsx
│   │   ├── AnnouncementsPage.tsx
│   │   ├── useFilteredAnnouncements.ts  # ★ با فیلتر + isAnnouncementVisibleTo
│   │   └── validators.ts
│   ├── assignments/     # ماژول تکالیف
│   │   ├── AssignmentForm.tsx          # ★ با DatePicker جلالی
│   │   ├── AssignmentsPage.tsx
│   │   ├── AssignmentsTable.tsx        # ★ جدول جداشده با ددلاینِ رنگی
│   │   ├── SubmissionForm.tsx          # با حالت نمایش پس از ددلاین
│   │   ├── SubmissionsPage.tsx
│   │   ├── useAssignmentsPageData.ts   # ★ هوک متمرکز داده صفحه
│   │   └── validators.ts
│   ├── attendance/      # ماژول حضور و غیاب (نقش‌محور)
│   │   ├── AttendancePage.tsx          # ★ ارکستراتور که بر اساس نقش رندر می‌کند
│   │   ├── TeacherAttendanceForm.tsx   # ★ فرم ثبت استاد + عملیات گروهی
│   │   ├── StudentAttendanceView.tsx   # ★ آمار/درصد/جزئیات جلسات دانشجو
│   │   └── AdminAttendanceReport.tsx   # ★ گزارش فقط‌مطالعه برای مدیر
│   ├── auth/            # ماژول احراز هویت
│   │   └── LoginPage.tsx               # ★ جابه‌جا شده از pages/LoginPage
│   ├── classes/         # ماژول کلاس‌ها
│   │   ├── ClassDetailsPage.tsx
│   │   ├── ClassesPage.tsx
│   │   ├── ClassFilters.tsx
│   │   ├── ClassForm.tsx               # ★ با SearchableMultiSelect (openDirection)
│   │   ├── ClassSessionsPanel.tsx      # ★ با ویرایش/حذف جلسه و ConfirmDialog
│   │   ├── ClassStudentsPanel.tsx
│   │   ├── ClassTable.tsx               # ★ با نشانگر ظرفیت بر اساس CAPACITY_THRESHOLDS
│   │   ├── classValidation.ts
│   │   ├── JoinClassPlaceholderPage.tsx # ★ صفحه جای‌نگشت ثبت‌نام (در حال توسعه)
│   │   ├── SessionForm.tsx
│   │   ├── sessionValidation.ts
│   │   └── StudentClassesPage.tsx       # ★ کلاس‌های منِ دانشجو
│   ├── dashboard/       # داشبورد نقش‌محور
│   │   ├── AdminDashboard.tsx
│   │   ├── DashboardContainer.tsx       # ★ با useAsyncData نقش‌محور
│   │   ├── StudentDashboard.tsx
│   │   └── TeacherDashboard.tsx        # ★ با نمودار موبایل/دسکتاپ و هوک‌های dashboardData
│   ├── errors/          # صفحات خطا
│   │   ├── ErrorPage.tsx               # ★ پایه قابل اشتراک صفحات خطا
│   │   ├── NotFoundPage.tsx
│   │   └── UnauthorizedPage.tsx
│   ├── profile/         # پروفایل کاربری
│   │   └── ProfilePage.tsx
│   └── users/           # ماژول مدیریت کاربران
│       ├── UserDetails.tsx             # ★ با استفاده از UserDetailsList
│       ├── UserFilters.tsx
│       ├── UserForm.tsx                # فرم کنترل‌شده + ResolveError
│       ├── UsersPage.tsx               # ★ با useAsyncData + useModalState
│       ├── UserTable.tsx               # ★ با Action/MenuItems و نشان «(شما)»
│       └── validators.ts
├── routes/              # پیکربندی Router و محافظ‌های دسترسی
│   ├── AppRoutes.tsx    # ★ با مسیرهای student-classes و classes/join/:classId
│   ├── ProtectedRoute.tsx
│   └── RoleGuard.tsx
├── services/            # لایه ارتباط با API
│   ├── api/
│   │   ├── axiosInstance.ts            # ★ با ApiError + Logger + STATUS_MESSAGES
│   │   └── baseApi.ts                  # API پایه با DeepPartial
│   ├── announcement.ts
│   ├── assignment.ts
│   ├── attendance.ts                   # ★ با calculateStudentStats
│   ├── auth.ts                         # ★ با removePassword
│   ├── class.ts                        # ★ با حذف آبشاری و setStatus
│   ├── session.ts
│   ├── submission.ts
│   └── user.ts                         # ★ با حذف وابسته + last-admin guard
├── types/               # تعریف تایپ‌های TypeScript
│   ├── announcement.ts
│   ├── assignment.ts
│   ├── attendance.ts
│   ├── auth.ts
│   ├── class.ts
│   ├── common.ts         # DeepPartial, Maybe, Nullable, DeepReadonly
│   ├── dashboard.ts      # ★ DashboardData + EMPTY_DASHBOARD_DATA
│   ├── session.ts
│   ├── submission.ts
│   └── user.ts           # ★ User / UserWithPassword + Payloadها
├── utils/               # توابع کمکی و قابل استفاده مجدد
│   ├── accessibility.ts  # ★ buildAriaDescribedBy
│   ├── announcementVisibility.ts # ★ isAnnouncementVisibleTo
│   ├── class.ts          # ★ getEffectiveStatus
│   ├── dashboardData.ts  # ★ هوک‌های داده داشبورد و آمار تصحیح
│   ├── error.ts          # ★ getErrorMessage
│   ├── formatDate.ts     # ★ formatDate, formatDateTime, formatRelativeTime, toDateInputValue, isDateBeforeToday
│   ├── guards.ts         # ★ isValidUser
│   ├── logger.ts         # ★ کلاس Logger توسعه‌محور
│   ├── ownership.ts      # ★ filterCollectionsByOwnership
│   ├── user.ts           # ★ getRoleLabel, getRoleVariant, getStatusLabel
│   ├── userSanitization.ts # ★ removePassword
│   ├── validateTitle.ts  # ★ اعتبارسنجی یکپارچه عنوان
│   └── validation.ts     # ★ emailRegex مشترک
├── index.css           # ★ استایل سراسری + فونت وزیرمتن با @theme (Tailwind v4)
├── main.tsx            # ★ نقطه ورود با مدیریت خطا و پروایدرها (رندر مستقیم AppRoutes)
└── vite-env.d.ts       # تایپ‌های متغیرهای محیطی
```

</div>

---

<div dir="rtl">

## 🚀 راهنمای نصب و راه‌اندازی (Setup & Installation)

برای راه‌اندازی محیط توسعه (Development Environment)، مراحل زیر را به ترتیب اجرا نمایید:

### ۱. دریافت و نصب وابستگی‌ها:

</div>

```bash
git clone <repository-url>
cd educonnect
npm install
```

<div dir="rtl">

### ۲. پیکربندی متغیرهای محیطی:

فایل `.env.example` را کپی کرده و با نام `.env` در ریشه پروژه ذخیره نمایید:

</div>

```bash
cp .env.example .env
```

```env
# .env
VITE_API_BASE_URL=http://localhost:4003
VITE_APP_ENV=development
VITE_STORAGE_PREFIX=educonnect_dev_
```

<div dir="rtl">

### ۳. اجرای سرور شبیه‌ساز (Mock API):

</div>

```bash
npm run server
```

<div dir="rtl">

> این دستور `json-server` را برای ارائه API فیک بر اساس فایل `db.json` در پورت `4003` اجرا می‌کند.

</div>

<div dir="rtl">

### ۴. اجرای سرور توسعه فرانت‌اند:

</div>

```bash
npm run dev
```

<div dir="rtl">

> پروژه به‌صورت پیش‌فرض در آدرس `http://localhost:5173` در دسترس خواهد بود.

</div>

<div dir="rtl">

### ۵. بررسی کیفیت کد:

</div>

```bash
npm run lint
```

<div dir="rtl">

> این دستور از **oxlint** برای بررسی سریع کدها استفاده می‌کند.

</div>

<div dir="rtl">

### ۶. ساخت نسخه نهایی (Production Build):

</div>

```bash
npm run build
```

---

<div dir="rtl">

## 👥 حساب‌های کاربری پیش‌فرض (Demo Credentials)

جهت تست و بررسی سناریوهای مختلف، می‌توانید از حساب‌های کاربری Seed شده در فایل `db.json` استفاده نمایید:

</div>

| نقش کاربری             | ایمیل (Email)      | رمز عبور (Password) |
| :--------------------- | :----------------- | :------------------ |
| **مدیر سیستم (Admin)** | `admin@edu.com`    | `123456`            |
| **استاد (Teacher)**    | `teacher1@edu.com` | `123456`            |
| **استاد (Teacher)**    | `teacher3@edu.com` | `123456`            |
| **دانشجو (Student)**   | `student1@edu.com` | `123456`            |

<div dir="rtl">

> سایر حساب‌های تستی در فایل `db.json` قابل مشاهده هستند.

</div>

---

<div dir="rtl">

## 📈 پیشرفت‌ها و بهبودهای اعمال‌شده نسبت به نسخه 3.6.4

نسخه **3.7.0** یک بازنگری جامع در **کیفیت معماری، قابل‌استفاده‌مجددشدن اجزا و غنای امکانات** است. در ادامه، مهم‌ترین تغییرات اعمال‌شده نسبت به نسخه 3.6.4 فهرست شده‌اند:

### 🏗️ معماری و ساختار کد

| مورد                        | نسخه 3.6.4                    | نسخه 3.7.0                                   |
| :-------------------------- | :---------------------------- | :------------------------------------------- |
| هوک‌های قابل استفاده مجدد  | ❌ (لج‌های state درون صفحات) | ✅ `useAsyncData`, `useMapById`, `useClickOutside`, `useMediaQuery`, `useModalState` |
| تمرکز آیکون‌ها             | ❌ (SVG پراکنده در کامپوننت‌ها) | ✅ ۳۰+ آیکون متمرکز در `common/icons.tsx`  |
| ماژول حضور و غیاب         | تک‌کامپوننت `AttendancePage`  | ✅ تفکیک به ۴ کامپوننت نقش‌محور + گزارش جدیدِ مدیر |
| داده داشبورد               | محاسبه‌ی inline در هر داشبورد | ✅ استخراج به `utils/dashboardData` + `types/dashboard` |
| نمودارها                   | تولتیپ/لیجند inline در هر داشبورد | ✅ کامپوننت‌های قابل اشتراک `ChartTooltip`/`ChartLegend` |
| تنظیمات و ناوبری          | hardcoded در Sidebar/صفحات   | ✅ متمرکز در `configs/constants` + `configs/navigation` |
| ساختار `SearchableMultiSelect` | یک کامپوننت حجیم          | ✅ تفکیک به ۶ زیرکامپوننت + ناوبری کامل کیبورد |
| اعتبارسنجی و منطق تکراری  | پراکنده در فرم‌ها            | ✅ توابع مشترک `validateTitle`, `validation`, `class`, `error`, ... |
| فرم کاربران/پروفایل       | جزئیات کاربر تکراری        | ✅ کامپوننت مشترک `UserDetailsList`          |

### 🎨 رابط کاربری و تجربه کاربری (UX)

| مورد                       | نسخه 3.6.4 | نسخه 3.7.0                       |
| :------------------------- | :--------- | :------------------------------- |
| تقویم تاریخ               | input HTML بومی (میلادی) | ✅ `DatePicker` جلالی با تبدیل دوطرفه |
| کلاس‌های منِ دانشجو      | ❌         | ✅ `StudentClassesPage` + نشان ظرفیت |
| ثبت‌نام در کلاس           | ❌         | ✅ `JoinClassPlaceholderPage` (جای‌نگشت) |
| گزارش حضورِ مدیر          | ❌ (سپری از نمای استاد) | ✅ `AdminAttendanceReport` فقط‌مطالعه |
| ددلاین تکالیف            | ورودی ساده | ✅ انتخاب با تقویم جلالی + اعتبارسنجی `isDateBeforeToday` |
| دکمه‌ها                    | ۴ variant  | ✅ افزودن `success` و `danger-light` |
| صفحات خطا                | کامل و تکراری | ✅ پایه قابل اشتراک `ErrorPage` + `ErrorAlert` |
| دراپ‌داون‌ها               | موقعیت‌یابی ساده | ✅ `createPortal` + موقعیت‌یابی خودکار (`ActionsMenu`, `MultiSelectDropdown`) |

### 🔐 امنیت، پایداری و بهینه‌سازی عملکرد

| مورد                        | نسخه 3.6.4 | نسخه 3.7.0                    |
| :-------------------------- | :--------- | :---------------------------- |
| جدا شدن رمز عبور از `User` | `password` اختیاری در `User` | ✅ `User` / `UserWithPassword` + `removePassword` |
| لاگ‌گذاری                  | `console` خام | ✅ کلاس `Logger` توسعه‌محور + `getErrorMessage` یکپارچه |
| اعتبارسنجی ساختار داده    | —          | ✅ `isValidUser` در `utils/guards` |
| واکشی داده اسی‌نک          | تکرار Promise در هر صفحه | ✅ متمرکز با `useAsyncData` (جلوگیری از Over-fetching و دوباره‌وارسی) |
| حذف وابسته از کاربر        | کلاس/حضور/تکلیف | ✅ + اطلاعیه و پاک‌سازی فهرست دانشجویان کلاس‌ها |
| سقف نوتیفیکیشن‌ها          | نامحدود    | ✅ `MAX_TOASTS = 5`            |
| ثابت‌سازی اعداد جادویی    | hardcoded  | ✅ متمرکز (`API_REQUEST_TIMEOUT_MS`, `CAPACITY_THRESHOLDS`, `MAX_ASSIGNMENT_GRADE`, `CHART_COLORS`, ...) |

</div>

---

<div dir="rtl">

## 🗺 نقشه راه توسعه (Development Roadmap)

فرآیند توسعه این سامانه بر اساس اصل **Dependency-Driven Development** فازبندی شده است؛ به‌گونه‌ای که هر فاز، پیش‌نیاز فاز بعدی را تأمین می‌کند و از وابستگی‌های معکوس جلوگیری می‌شود.

---

### ✅ فازهای هسته — تکمیل شده (فاز ۱ تا ۱۰)

این ده فاز، ستون فقرات پروژه را تشکیل می‌دهند و به‌صورت کامل در کد فعلی پیاده‌سازی و قابل مشاهده هستند:

| فاز | عنوان                             |  وضعیت   | خلاصه پیاده‌سازی                                                                                                                                                                                                                                                                                                                                                                           |
| :-: | :-------------------------------- | :------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  ۱  | پایه فنی و اسکلت پروژه            | ✅ تکمیل | راه‌اندازی React 19 + TypeScript + Vite 8 + Tailwind CSS v4، ساختار پوشه‌ها، لایه سرویس (`baseApi`)، کامپوننت‌های پایه (`Button`, `Input`, `Modal`, `Table`, `Card`, `ConfirmDialog`, `SearchInput`, `StatusChip`, `EmptyState`, `Loading`, `StatCard`)، `db.json` با داده‌های اولیه، تایپ‌های کامل (`User`, `Class`, `Session`, `Attendance`, `Announcement`, `Assignment`, `Submission`) |
|  ۲  | احراز هویت، نقش‌ها و کنترل دسترسی | ✅ تکمیل | `AuthContext` + `AuthProvider`، `LoginPage` (در `pages/auth`)، `ProtectedRoute` و `RoleGuard` با آرایه‌های نقش متمرکز، منوی نقش‌محور در `Sidebar` (از `configs/navigation`)، ذخیره نشست در `localStorage` **بدون ذخیره رمز عبور** (`removePassword`)، بازیابی نشست با `isValidUser`، صفحه `Unauthorized` (از `ErrorPage`) |
|  ۳  | مدیریت کاربران                    | ✅ تکمیل | `UsersPage` با جدول دسکتاپ/کارت موبایل و `useModalState`/`useAsyncData`، `UserForm`، جستجو/فیلتر نقش و وضعیت، حذف/فعال‌سازی/غیرفعال‌سازی با `ConfirmDialog`، `UserDetails` (با `UserDetailsList`)، محافظت از آخرین مدیر، `Toast` برای بازخورد |
|  ۴  | کلاس‌ها و جلسات                   | ✅ تکمیل | `ClassesPage` با فیلتر استاد/وضعیت/جستجو، `ClassForm` با `SearchableMultiSelect` (جستجو + چیپ + کیبورد)، `ClassDetailsPage`، `SessionForm` (ویرایش/حذف)، حذف آبشاری (جلسات ← حضور و غیاب ← تکالیف)، غیرفعال/فعال‌سازی کلاس، اعتبارسنجی ظرفیت و عنوان، ریسپانسیو کامل |
|  ۵  | حضور و غیاب (نقش‌محور)             | ✅ تکمیل | ارکستراتور `AttendancePage` + `TeacherAttendanceForm` (ثبت + حاضر/غایب کردن همه)، `StudentAttendanceView` (آمار/درصد/جزئیات) و **`AdminAttendanceReport` (گزارش فقط‌مطالعه)**، محاسبه خودکار درصد حضور (`calculateStudentStats`)، پارامترهای `classId`/`sessionId` در آدرس |
|  ۶  | اطلاعیه‌ها                        | ✅ تکمیل | `AnnouncementsPage` با کارت‌های ریسپانسیو، `AnnouncementForm`، مخاطب‌گذاری بر اساس کلاس/نقش/مخاطب داخل کلاس، وضعیت مشاهده (`Seen`/`Unseen`) با نشانگر بصری، بازنشانی وضعیت مشاهده پس از ویرایش، هوک اختصاصی `useFilteredAnnouncements` با `isAnnouncementVisibleTo` |
|  ۷  | تکالیف و ارزیابی                  | ✅ تکمیل | `AssignmentsPage` + `AssignmentsTable` با ددلاینِ رنگی و `useAssignmentsPageData`، `AssignmentForm` با **تقویم جلالی** و اعتبارسنجی ددلاین، `SubmissionForm` (ارسال/ویرایش/مشاهده پس از ددلاین + کپی)، `SubmissionsPage` با نمره‌دهی ۰ تا ۲۰ و بازخورد، حذف آبشاری پاسخ‌ها |
|  ۸  | داشبوردهای اختصاصی                | ✅ تکمیل | `DashboardContainer` با واکشی نقش‌محورِ `useAsyncData`، استخراج داده به `utils/dashboardData`، `AdminDashboard`/`TeacherDashboard`/`StudentDashboard` با نمودارهای `Recharts` + `ChartTooltip`/`ChartLegend` مشترک و `StatCard` |
|  ۹  | یکپارچه‌سازی و UX ضروری           | ✅ تکمیل | مدیریت جامع خطاها در `axiosInstance` (کلاس `ApiError` + `Logger`)، `react-error-boundary` + `RouterErrorBoundary` + `ErrorPage`، `ScrollToTop` (محتوا)، لینک پرش به محتوا، `Toast` با سقف ۵، `EmptyState`/`Loading`/`Spinner`، ریسپانسیو نهایی، فونت وزیرمتن با `@theme`، حذف فایل‌های تکراری |
| ۱۰  | تست، رفع باگ و آماده‌سازی ارائه   | ✅ تکمیل | `db.json` نهایی با کاربران، کلاس‌ها، جلسات، حضور و غیاب، اطلاعیه‌ها، تکالیف و پاسخ‌ها، سه نقش نمونه (مدیر/استاد/دانشجو)، سناریوهای دمو آماده |
| ۱۱  | ★ کلاس‌های منِ دانشجو            | ✅ تکمیل | `StudentClassesPage` با نمایش کلاس‌های ثبت‌نام‌شده + نشان ظرفیت رنگی + مسیر `classes/join/:classId` با `JoinClassPlaceholderPage` (ثبت‌نام، در حال توسعه) |
| ۱۲  | ★ ارتقای کیفیت معماری (این نسخه)   | ✅ تکمیل | استخراج ۵ هوک قابل استفاده مجدد، متمرکزسازی آیکون/تنظیمات/نمودار/اعتبارسنجی/توابع، جداسازی `User` از `UserWithPassword`، `Logger` و `getErrorMessage` یکپارچه، تفکیک ماژول حضور و غیاب به ۴ نمای نقش‌محور |

---

### 🔸 فازهای توسعه‌ای — در انتظار اجرا (فاز ۱۳ به بعد)

این فازها پس از تکمیل هسته اصلی آغاز می‌شوند و به ترتیب اولویت‌بندی زیر اجرا خواهند شد:

| فاز | عنوان                               |          وضعیت          | اولویت | توضیحات                                                                                                                           |
| :-: | :---------------------------------- | :---------------------: | :----: | :-------------------------------------------------------------------------------------------------------------------------------- |
| ۱۳  | مرکز اعلان‌ها (Notification Center) |      ⏳ در انتظار       |  بالا  | اعلان‌های خوانده‌نشده، `mark as read`، لینک به صفحه مرتبط، هشدار ددلاین نزدیک                                                     |
| ۱۴  | وضعیت‌ها و آرشیو (Lifecycle)        |     ⚠️ بخشی در هسته     |  بالا  | وضعیت `active`/`inactive` کلاس و کاربر اجرا شده؛ سیستم کامل `Draft`/`Published`/`Archived` و آرشیو اطلاعیه و تکلیف باقی مانده است |
| ۱۵  | تقویم آموزشی و یادآورها             |     ⚠️ پایه‌ریزی شده     |  متوسط  | `DatePicker` جلالی آماده است؛ نمایش بصری جلسات و ددلاین‌ها روی تقویم + یادآور ساده باقی مانده است |
| ۱۶  | اتاق گفتگوی آموزشی (Discussion)     |      ⏳ در انتظار       |  متوسط  | چت کلاسی، ارسال پیام، پاسخ‌دهی، `seen`/`unseen` پیام‌ها                                                                           |
| ۱۷  | تکمیل ثبت‌نام در کلاس              |     ⚠️ جای‌نگشت آماده   |  متوسط  | `JoinClassPlaceholderPage` آماده است؛ منطق واقعی ثبت‌نام/ورود دانشجو به کلاس باقی مانده است                                       |
| ۱۸  | پروفایل پیشرفته و Activity Log      | ⚠️ پروفایل پایه در هسته | متوسط  | پروفایل با `UserDetailsList` اجرا شده؛ آواتار، تاریخچه فعالیت‌ها و اطلاعات تکمیلی باقی مانده است |
| ۱۹  | سیستم آزمون‌ساز آنلاین              |      ⏳ در انتظار       |  پایین  | ساخت آزمون، سوالات تستی و تشریحی، تصحیح و نمره‌دهی (پرهزینه‌ترین فاز)                                                             |
| ۲۰  | بهبودهای رزومه‌ای نهایی             |      ⏳ در انتظار       |  پایین  | حالت تاریک، جستجوی سراسری، شخصی‌سازی ویجت‌ها، نمودارهای پیشرفته                                                                   |

---

<div dir="rtl">

## 👨‍💻 توسعه‌دهنده

**محمد حیدری**

توسعه‌دهنده فرانت‌اند | علاقه‌مند به معماری نرم‌افزار، تجربه کاربری و تکنولوژی‌های نوین وب

---

_طراحی، معماری و پیاده‌سازی شده با ❤️ | مبتنی بر اکوسیستم React و TypeScript_

**نسخه: 3.7.0** | **آخرین به‌روزرسانی: آبان ۱۴۰۵**

</div>
