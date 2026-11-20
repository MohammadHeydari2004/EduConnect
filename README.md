<div dir="rtl">

# 🎓 EduConnect | سامانه جامع مدیریت و ارتباطات آموزشی

---

## 📖 معرفی و چشم‌انداز پروژه

**EduConnect**
یک پلتفرم یکپارچه، تحت وب و مبتنی بر نقش (Role-Based) برای مدیریت فرآیندهای آموزشی، ارتباطی و نظارتی میان **دانشجویان، اساتید و مدیران گروه** است. این سامانه با هدف شبیه‌سازی یک محیط واقعی دانشگاهی (LMS) طراحی شده و معماری آن بر پایه تفکیک دقیق دغدغه‌ها (Separation of Concerns)، توسعه مبتنی بر وابستگی (Dependency-Driven Development)، استفاده از هوک‌های اختصاصی (Custom Hooks) و الگوهای مدرن مدیریت حالت (State Management) استوار است.

هدف غایی این پروژه، ارائه یک راهکار نرم‌افزاری چابک برای پوشش نیازهای آموزشی، مدیریت کلاس‌ها، رصد حضور و غیاب، چرخه حیات تکالیف و ارائه داشبوردهای تحلیلی اختصاصی است.

> **نسخه فعلی پروژه `5.0.0`** است. تمرکز این نسخه بر **بازسازی بنیادین معماری فرانت‌اند**، **ماژولارسازی کامل کامپوننت‌ها، هوک‌ها، ثابت‌ها و تایپ‌ها**، **استخراج لایه‌ی سرویس متمرکز با مدیریت خطای ساختاریافته**، **تفکیک نقش‌محور صفحات** و **سخت‌گیری حداکثری در لینت/تایپ‌چک/بیلد** بوده است.

</div>

---

<div dir="rtl">

## ✨ ویژگی‌های کلیدی و ماژول‌های پیاده‌سازی شده

### 🛡 مدیریت هویت و دسترسی‌ها (IAM & RBAC)

- **احراز هویت امن:** ورود و خروج با Context API و LocalStorage (بدون ذخیره رمز عبور در کلاینت) — `AuthProvider` با `AuthContext`.
- **کنترل دسترسی مبتنی بر نقش:** محافظت از مسیرها (`ProtectedRoute`) و گارد نقش (`RoleGuard`) برای سه نقش کلیدی: `Admin`، `Teacher` و `Student` — با آرایه‌های متمرکز نقش (`ALL_ROLES`, `ADMIN_ROLES`, `TEACHER_AND_ABOVE_ROLES`, `TEACHER_ROLES`, `STUDENT_ROLES`) در `configs/constants/roles.ts`.
- **مدیریت چرخه حیات کاربران:** ایجاد، ویرایش، تعلیق/فعال‌سازی (Suspend/Activate) و تغییر نقش کاربران توسط مدیر — با جدول ریسپانسیو و منوی اکشن موبایل.
- **محافظت از آخرین مدیر:** جلوگیری از حذف، تغییر نقش یا غیرفعال‌سازی آخرین کاربر فعال با نقش `admin` (`ensureNotLastAdmin`).
- **اعتبارسنجی ایمیل یکتا:** جلوگیری از ثبت ایمیل تکراری در سطح سرویس (`ensureEmailIsUnique`).
- **حذف آبشاری وابسته به کاربر:** حذف خودکار کلاس‌ها، حضور و غیاب، پاسخ‌ها و اطلاعیه‌های متعلق به کاربر + پاک‌سازی دانشجو از فهرست کلاس‌ها و لیست `seenBy` اطلاعیه‌ها هنگام حذف حساب (`cascadeDeleteUserData`).
- **جداسازی رمز عبور:** تایپ `User` (تمیز، بدون رمز) از `UserWithPassword` جدا شده و تابع `removePassword` قبل از ذخیره، رمز را حذف می‌کند.
- **اعتبارسنجی ساختار کاربر:** تابع `isValidUser` (در `utils/guards.ts`) برای صحت داده‌های بازیابی‌شده از `localStorage`.
- **پیشوند ذخیره‌سازی:** کلیدهای LocalStorage با پیشوند پویا از `VITE_STORAGE_PREFIX` (`authStorage`).

### 🏛 مدیریت آموزشی (Academic Management)

- **مدیریت کلاس‌ها و جلسات:** تعریف دوره‌ها، تخصیص ظرفیت، انتصاب استاد، انتخاب دانشجویان با `SearchableMultiSelect` و زمان‌بندی جلسات آموزشی.
- **صفحه «کلاس‌های من» برای دانشجو:** `StudentClassesPage` نمایش کلاس‌های ثبت‌نام‌شده با نشانگر رنگی ظرفیت و وضعیت.
- **صفحه جزئیات کلاس (نقش‌محور):** `ClassDetailsPage` با پنل دانشجویان (`ClassStudentsPanel`) و پنل جلسات (`ClassSessionsPanel`)، و مسیر جدا برای تکالیف هر کلاس.
- **انتخاب دانشجویان پیشرفته:** کامپوننت `SearchableMultiSelect` با جستجو، انتخاب گروهی، انتخاب نتایج فیلترشده، چیپ (Chip)، **ناوبری کامل با کیبورد** (فلش‌ها، Home/End، Enter/Space، Escape) و **تفکیک به زیرکامپوننت‌ها** (`MultiSelectTrigger`, `MultiSelectDropdown`, `MultiSelectOption`, `MultiSelectActions`, `MultiSelectEmpty`).
- **سیستم حضور و غیاب نقش‌محور:** ارکستراتور `AttendancePage` + `TeacherAttendanceForm` (ثبت استاد + عملیات گروهی «حاضر/غایب کردن همه»)، `StudentAttendanceView` (آمار، درصد و جزئیات جلسات دانشجو) و **`AdminAttendanceReport` (گزارش فقط‌مطالعه برای مدیر)**.
- **محاسبه خودکار آمار حضور:** تابع `calculateStudentStats` (حاضر، با تأخیر، غایب، درصد) و `saveAttendanceForSession` برای ذخیره‌ی هوشمند Create/Update/Delete سوابق.
- **چرخه حیات تکالیف (Assignments):** تعریف تکلیف، تعیین مهلت، ارسال پاسخ توسط دانشجو، فرآیند نمره‌دهی (۰ تا ۲۰) و بازخورد توسط استاد — با **تفکیک کامل نقش‌محور** (استاد/دانشجو).
- **نشانگر ددلاین هوشمند:** `DeadlineBadge` با رنگ‌های سبز/زرد/قرمز بر اساس فاصله تا ددلاین (`getDeadlineColor`).
- **مدیریت پاسخ‌ها و نمره‌دهی:** `SubmissionsPage` + `StudentGradeCard` با ثبت نمره، بازخورد، «بازگشت برای اصلاح» (Returned) و ثبت خودکار نمره‌ی ۰ برای ارسال‌نشده‌ها.
- **حالت نمایش پس از ددلاین:** مشاهده و کپی پاسخ ارسالی بدون امکان ویرایش؛ و پاسخ‌های برگشتی قابل ویرایش مجدد (`SubmissionForm`).
- **حذف آبشاری (Cascade Delete):** سرویس متمرکز `cascadeDelete.ts` با تابع جنریک `cascadeProcess` برای پاک‌سازی وابستگی‌های کلاس/کاربر/جلسه (`removeStudentsFromClassCascade`, `cascadeDeleteUserData`).

### 📢 سیستم اطلاعیه‌ها (Announcements)

- انتشار اطلاعیه‌های عمومی (Global) یا هدفمند (Targeted) با انتخاب کلاس، نقش‌ها یا مخاطبان داخل کلاس.
- **مجوزهای نقش‌محور:** هوک `useAnnouncementPermissions` با `canCreate`, `canViewItem`, `canManageItem`.
- منطق نمایش متمرکز: `isAnnouncementVisibleTo` / `isUserInTargetAudience` (در `utils/announcementVisibility.ts`).
- قابلیت رهگیری وضعیت مشاهده (Seen/Unseen) برای هر کاربر + `markAsSeen` و بازنشانی وضعیت مشاهده پس از ویرایش (`resetSeenBy`).
- نشانگر بصری اطلاعیه‌های خوانده‌نشده (نقطه آبی + برچسب «جدید») و کارت/مدال ریسپانسیو (`AnnouncementCard`, `AnnouncementViewModal`).
- فرم اطلاعیه با زیرکامپوننت‌های `AnnouncementFormParts` (نقش‌ها / مخاطبان کلاس) و `buildAnnouncementPayload`.

### 📊 داشبوردهای تحلیلی و آماری (Analytics Dashboards)

- **داشبورد مدیر:** نظارت بر آمار کلان سامانه، توزیع نقش‌ها (نمودار دایره‌ای) و آخرین کلاس‌های ثبت‌شده.
- **داشبورد استاد:** رصد تکالیف نیازمند تصحیح (نمودار میله‌ای با حالت موبایلِ کارت‌محور)، وضعیت تصحیح به تفکیک کلاس و جلسات اخیر.
- **داشبورد دانشجو:** نمایش درصد حضور (نمودار دایره‌ای)، تکالیف نزدیک ددلاین و اطلاعیه‌های مرتبط.
- **تفکیک داده داشبورد:** محاسبه داده به `hooks/dashboardData.ts` (هوک‌های `useTeacherDashboardData`, `useStudentDashboardData`) و `hooks/dashboardStats.ts` (`useGradingStats`, `useRecentSessions`, `useChartSummary`) منتقل شده است.
- **کامپوننت‌های نمودار قابل اشتراک:** `ChartTooltip`, `ChartLegend`, `PieChartCard` با تایپ مشترک `ChartPayloadEntry` + پالت رنگی متمرکز `CHART_COLORS`.
- **واکشی نقش‌محور:** `DashboardContainer` با `useAsyncData` فقط داده‌های مورد نیاز هر نقش را واکشی می‌کند (جلوگیری از Over-fetching).

### 🎨 تجربه کاربری و رابط کاربری (UX/UI)

- **طراحی کاملاً ریسپانسیو:** پشتیبانی از موبایل، تبلت و دسکتاپ با هوک `useMediaQuery`/`useIsMobile`.
- **کارت‌های موبایل:** نمایش داده‌ها به‌صورت کارت در صفحات کوچک به‌جای جدول (با `renderMobileCard`/`renderMobileActions` در `Table`).
- **منوی اکشن هوشمند:** `ActionsMenu` و `MenuItem` با رندر `createPortal`، موقعیت‌یابی خودکار و مدیریت بسته‌شدن (`menuClose`).
- **سیستم نوتیفیکیشن (Toast):** `ToastContext` + `ToastProvider` با سقف `MAX_TOASTS = 5`، خودحذفی پس از ۴ ثانیه، توقف روی hover و نمایش جزئیات خطا.
- **مدال‌های بهینه:** بستن با Escape، کلیک خارج، قفل اسکرول، رندر با `createPortal` و **Focus Trap کامل** (`Tab`/`Shift+Tab`).
- **مدیریت خطای پیشرفته:** `react-error-boundary` با `ErrorBoundaryWrapper`/`RouterErrorBoundary` (reset بر اساس مسیر) + صفحات خطای `ErrorPage`/`NotFoundPage`/`UnauthorizedPage`.
- **اسکرول به بالا و فوکوس:** بازنشانی اسکرول و مدیریت فوکوس در تغییر مسیر (`MainLayout`).
- **لینک پرش به محتوا:** دسترسی‌پذیری بهتر با «پرش به محتوای اصلی».
- **آیکون‌های متمرکز:** ۳۱ آیکون SVG در پوشه‌ی `components/common/icons/` (هر آیکون یک فایل مجزا با بشکه‌ی `index.ts`).
- **فونت فارسی وزیرمتن:** پشتیبانی کامل از فارسی و RTL (پیکربندی با `@theme` در `index.css` برای Tailwind v4).
- **فرم‌های هوشمند:** اعتبارسنجی با `react-hook-form` (UserForm) و الگوی `useFieldErrors` برای سایر فرم‌ها + `validateTitle`، `validation.ts`، `validators.ts` ماژولار.
- **نشانگر ظرفیت رنگی:** `ClassCapacityBadge` بر اساس آستانه‌های `CAPACITY_THRESHOLDS` (در `utils/tableHelpers.ts`).
- **وضعیت/برچسب‌های متمرکز:** `getRoleLabel`, `getStatusLabel`, `ATTENDANCE_LABELS`, `StatusChip`, `Badge`, `DeadlineBadge`.

### 🔐 امنیت، پایداری و زیرساخت شبکه

- **عدم ذخیره رمز عبور:** حذف `password` از شیء کاربر (با `removePassword`) قبل از ذخیره در `localStorage`.
- **مدیریت خطای شبکه:** کلاس ساختاریافته `ApiError` با `userMessage`, `status`, `code`, `url`, `serverData` + Type Guard `isApiError` در `services/api/axiosInstance.ts`.
- **پیام‌های اختصاصی خطا:** برای تایم‌اوت، عدم دسترسی به سرور، خطای سرور و کدهای HTTP (با جدول `HTTP_STATUS_MESSAGES`).
- **اینترسپتورهای Axios:** مدیریت یکپارچه خطاها؛ تایم‌اوت از `API_REQUEST_TIMEOUT_MS` و لغو درخواست‌ها با `AbortSignal` در `useAsyncData`.
- **API پایه یکپارچه:** `baseApi` با `getAll`, `getById`, `create`, `update` (DeepPartial), `delete`, `nullifyDependents`, `deleteDependents`.
- **اعتبارسنجی ورود:** بررسی نقش، وضعیت فعال و پیام «ایمیل یا رمز عبور نادرست» در `auth.ts` + `normalizeEmail`.
- **دسترس‌پذیری (A11y):** استفاده از `sr-only`, `aria-label`, `aria-expanded`, `role`, `aria-live`, `inert` در سراسر کامپوننت‌ها.

</div>

---

<div dir="rtl">

## 🛠 پشته تکنولوژی (Tech Stack)

| دسته‌بندی            | تکنولوژی‌ها و ابزارها                       | نسخه           |
| :------------------- | :------------------------------------------ | :------------- |
| **هسته فرانت‌اند**   | React, TypeScript (Strict Mode), Vite       | 19.3, 7.0, 8.3 |
| **طراحی و استایل**   | Tailwind CSS (v4، پیکربندی با `@theme`), Vazirmatn Font, RTL Support | 4.3 |
| **مسیریابی و State** | React Router DOM, React Context API         | 7.18           |
| **مدیریت فرم‌ها**    | React Hook Form, Custom Validators          | 7.91           |
| **لایه شبکه**        | Axios, Custom API Wrapper (baseApi)         | 1.21           |
| **مصورسازی داده**    | Recharts (با تولتیپ/لیجند/کارت قابل اشتراک)  | 3.10           |
| **مدیریت خطا**       | react-error-boundary                        | 6.1            |
| **سرور شبیه‌ساز**    | JSON Server (Mock REST API)                 | 1.0            |
| **کیفیت کد**         | oxlint (سخت‌گیرانه), Prettier, TypeScript Strict, Husky | —              |
| **بیلد و عملکرد**    | oxc minify, lightningcss, chunk splitting   | —              |
| **متغیرهای محیطی**   | `.env` با `VITE_API_BASE_URL` و `VITE_STORAGE_PREFIX` | —              |

</div>

---

<div dir="rtl">

## 📂 معماری و ساختار دایرکتوری‌ها

معماری پروژه به‌صورت ماژولار، نقش‌محور و مقیاس‌پذیر طراحی شده است تا توسعه و نگهداری آن در فازهای آتی تسهیل گردد. ایمپورت‌ها از طریق **alias `#`** به ریشه‌ی `src/` انجام می‌شوند:

</div>

```text
src/
├── components/
│   ├── common/               # کامپوننت‌های مشترک دامنه‌محور
│   │   ├── AnnouncementCard.tsx        # کارت اطلاعیه (ریسپانسیو، خوانده/نخوانده)
│   │   ├── AnnouncementViewModal.tsx   # مدال مشاهده جزئیات اطلاعیه
│   │   ├── AssignmentFilterCard.tsx    # فیلتر تکالیف (جستجو/کلاس/وضعیت)
│   │   ├── AttendanceClassSessionSelector.tsx # انتخاب کلاس/جلسه برای حضور
│   │   ├── ClassCapacityBadge.tsx      # نشانگر ظرفیت رنگی کلاس
│   │   ├── EmptyState.tsx              # حالت خالی با آیکون و اکشن
│   │   ├── ErrorBoundaryWrapper.tsx    # مدیریت خطا با react-error-boundary
│   │   ├── Header.tsx                  # هدر با منو، نشان نقش و خروج
│   │   ├── icons/                      # ★ ۳۱ آیکون SVG (هر آیکون فایل مجزا + index.ts)
│   │   ├── Loading.tsx                 # اسپینر سراسری
│   │   ├── RouterErrorBoundary.tsx     # مرز خطا بر اساس مسیر
│   │   └── Sidebar.tsx                 # منوی کشویی/سایدبار با فیلتر نقش‌محور
│   └── ui/                   # کامپوننت‌های پایه و قابل استفاده مجدد
│       ├── ActionsMenu.tsx             # منوی اکشن با پورتال و موقعیت‌یابی هوشمند
│       ├── AnnouncementFormParts.tsx   # قطعات فرم اطلاعیه (نقش‌ها / مخاطبان)
│       ├── Badge.tsx / Button.tsx / Card.tsx
│       ├── ChartLegend.tsx / ChartTooltip.tsx / PieChartCard.tsx
│       ├── ConfirmDialog.tsx / ErrorAlert.tsx / EmptyListState.tsx / FieldWrapper.tsx
│       ├── DeadlineBadge.tsx           # نشان ددلاین رنگی
│       ├── Input.tsx / Select.tsx / Textarea.tsx / SearchInput.tsx / StatCard.tsx
│       ├── MenuItem.tsx / Modal.tsx / Spinner.tsx / StatusChip.tsx / Table.tsx
│       ├── MultiSelectTrigger/Dropdown/Option/Actions/Empty.tsx
│       ├── SearchableMultiSelect.tsx   # انتخاب چندگانه با ناوبری کامل کیبورد
│       └── UserDetailsList.tsx         # جزئیات کاربر قابل اشتراک
├── configs/
│   ├── constants/           # ★ ثابت‌های ماژولار (۱۳ فایل)
│   │   ├── apiConstants.ts / announcementConstants.ts / attendanceConstants.ts
│   │   ├── backendMessages.ts / classConstants.ts / dashboardConstants.ts
│   │   ├── dialogStrings.ts / formStrings.ts / roles.ts / storageKeys.ts
│   │   ├── toastMessages.ts / userLabels.ts / index.ts
│   └── navigation.tsx       # آیتم‌های منو (navItems) با فیلتر نقش‌محور
├── contexts/
│   ├── AuthContext.ts       # کانتکست احراز هویت + هوک useAuth
│   ├── AuthProvider.tsx     # فراهم‌کننده احراز هویت (Readonly + بازیابی با isValidUser)
│   ├── ToastContext.ts      # کانتکست نوتیفیکیشن (تایپ‌ها و هوک)
│   └── ToastProvider.tsx    # فراهم‌کننده نوتیفیکیشن با سقف MAX_TOASTS
├── hooks/                   # ★ هوک‌های اختصاصی و قابل استفاده مجدد (۲۲ فایل)
│   ├── useAsyncData.ts      # واکشی داده با loading/error/refresh و AbortSignal
│   ├── useCrudPage.ts       # CRUD/pageState/asyncData متمرکز برای صفحات لیست/فرم
│   ├── useFilter.ts         # فیلترسازی + کارخانه‌های createStringContainsFilter/exactMatch/dateStatus
│   ├── useModalState.ts / useFieldErrors.ts / useMapById.ts / useMediaQuery.ts
│   ├── useClickOutside.ts / useLockBodyScroll.ts / usePortalPosition.ts / menuClose.ts
│   ├── dashboardData.ts / dashboardStats.ts
│   ├── useAnnouncementPermissions.ts / useAnnouncementsPage.ts / useAttendancePage.ts
│   ├── useAssignmentLookups.ts / useClassesPage.ts / useSubmissionsPage.ts
│   ├── useTeacherAssignmentsPage.ts / useToast.ts / useToastHelpers.ts
├── layouts/
│   └── MainLayout.tsx       # لایوت اصلی (هدر + سایدبار + اسکرول/فوکوس/لینک پرش)
├── pages/
│   ├── announcements/       # AnnouncementForm, AnnouncementsPage, validators
│   ├── assignments/         # AssignmentForm, assignmentFilters, StudentAssignments*, TeacherAssignments*, StudentGradeCard, SubmissionForm, SubmissionsPage, validators
│   ├── attendance/          # AttendancePage (ارکستراتور), TeacherAttendanceForm, StudentAttendanceView, AdminAttendanceReport, attendanceColumns
│   ├── auth/                # LoginPage
│   ├── classes/             # ClassesPage, ClassDetailsPage, ClassForm, ClassFilters, ClassTable, ClassSessionsPanel, ClassStudentsPanel, SessionForm, classValidation, sessionValidation, StudentClassesPage
│   ├── dashboard/           # DashboardContainer, AdminDashboard, TeacherDashboard, StudentDashboard, GradingTooltipContent
│   ├── errors/              # ErrorPage (پایه), NotFoundPage, UnauthorizedPage
│   ├── profile/             # ProfilePage
│   └── users/               # UsersPage, UserForm, UserTable, UserFilters, UserDetails, useUsersPage
├── routes/
│   ├── AppRoutes.tsx        # مسیرهای نقش‌محور با Lazy Loading + Suspense
│   ├── ProtectedRoute.tsx   # محافظ احراز هویت
│   └── RoleGuard.tsx        # محافظ نقش
├── services/
│   ├── api/
│   │   ├── axiosInstance.ts # ★ با ApiError + isApiError + HTTP_STATUS_MESSAGES
│   │   └── baseApi.ts       # API پایه با DeepPartial + nullify/deleteDependents
│   ├── announcement.ts / assignment.ts / attendance.ts / auth.ts
│   ├── cascadeDelete.ts     # حذف آبشاری یکپارچه (جنریک cascadeProcess)
│   ├── class.ts / session.ts / submission.ts / user.ts
├── types/                   # تعریف تایپ‌های TypeScript
│   ├── index.ts             # ★ بشکه‌ای (Barrel) خروجی یکپارچه همه تایپ‌ها
│   ├── common.ts / user.ts / class.ts / session.ts / attendance.ts
│   ├── announcement.ts / assignment.ts / submission.ts / dashboard.ts
│   ├── error.ts / hooks.ts / select.ts / cascade.ts / auth.ts
├── utils/                   # توابع کمکی و قابل استفاده مجدد (۲۱ فایل)
│   ├── index.ts             # ★ بشکه‌ی متمرکز صادرات توابع
│   ├── formatDate.ts / deadline.ts / email.ts / gradingStats.ts / recentItems.ts
│   ├── announcementPayload.ts / announcementVisibility.ts / authStorage.ts
│   ├── chart.ts / class.ts / guards.ts / hasActiveFilters.ts / nameHelpers.ts
│   ├── roleUtils.ts / selectValue.ts / tableHelpers.ts / userLabels.ts
│   ├── userSanitization.ts / validateTitle.ts / validation.ts
├── index.css                # استایل سراسری + فونت وزیرمتن با @theme (Tailwind v4)
├── main.tsx                 # نقطه ورود (BrowserRouter + ToastProvider + RouterErrorBoundary + AuthProvider + AppRoutes)
└── vite-env.d.ts            # تایپ‌های متغیرهای محیطی
```

</div>

---

<div dir="rtl">

## 🚀 راهنمای نصب و راه‌اندازی (Setup & Installation)

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
VITE_STORAGE_PREFIX=educonnect_dev_
```

<div dir="rtl">

> `VITE_API_BASE_URL` باید با پورت دستور `server` یکی باشد؛ `VITE_STORAGE_PREFIX` برای جلوگیری از تداخل کلیدهای LocalStorage در یک دامنه استفاده می‌شود.

### ۳. اجرای سرور شبیه‌ساز (Mock API):

</div>

```bash
npm run server
```

<div dir="rtl">

> این دستور `json-server` را برای ارائه API فیک بر اساس فایل `db.json` در پورت `4003` اجرا می‌کند. اگر `db.json` را دستی ویرایش می‌کنید، برای اعمال تغییرات سرور را متوقف و دوباره راه‌اندازی نمایید.

### ۴. اجرای سرور توسعه فرانت‌اند:

</div>

```bash
npm run dev
```

<div dir="rtl">

> پروژه به‌صورت پیش‌فرض در آدرس `http://localhost:4273` در دسترس خواهد بود (پورت در `vite.config.ts` تنظیم شده و `--strictPort` است).

### ۵. بررسی کیفیت کد:

</div>

```bash
npm run lint        # اصلاح خودکار
npm run lint:check  # بررسی بدون تغییر
npm run typecheck   # بررسی کامل TypeScript
npm run check       # typecheck + lint:check (پیش از هر کامیت با Husky)
```

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

## 📈 پیشرفت‌ها و بهبودهای اعمال‌شده

### 🏗 نسخه ۵.۰.۰ — بازسازی بنیادین معماری و ماژولارسازی کامل

| مورد                          | نسخه 3.9.7                                              | نسخه 5.0.0                                                                      |
| :---------------------------- | :------------------------------------------------------ | :------------------------------------------------------------------------------ |
| ساختار کامپوننت‌ها            | آیکون‌ها در یک فایل `icons.tsx`                         | ✅ آیکون‌ها در پوشه `icons/` (فایل مجزا + بشکه `index.ts`)، تفکیک کامل `common/` و `ui/` |
| کانتکست Toast                 | یک فایل `ToastContext.tsx`                              | ✅ تفکیک `ToastContext.ts` (تایپ‌ها) + `ToastProvider.tsx` (منطق)               |
| فرم‌ها                        | مدیریت خطا به‌صورت دستی در هر فرم                       | ✅ هوک `useFieldErrors` برای مدیریت خطای فیلدها + `react-hook-form` در UserForm |
| داده داشبورد                  | هوک‌های پراکنده در `dashboardData.ts`                   | ✅ تفکیک `dashboardData.ts` (داده) و `dashboardStats.ts` (آمار/نمودار)          |
| تایپ‌ها                       | تایپ‌های پراکنده                                       | ✅ بشکه‌ی `types/index.ts` + تایپ‌های `error.ts`, `hooks.ts`, `select.ts`       |
| ثابت‌ها                       | ثابت‌های پراکنده                                       | ✅ ماژولارسازی کامل (۱۳ فایل در `configs/constants`) + بشکه‌ی `index.ts`        |
| سرویس شبکه                   | خطا به‌صورت دستی                                       | ✅ `ApiError` + `isApiError` + `HTTP_STATUS_MESSAGES` در `axiosInstance`        |
| حذف آبشاری                   | توابع تکراری                                           | ✅ `cascadeProcess` جنریک + `removeStudentsFromClassCascade` + `cascadeDeleteUserData` |
| Lookup تکالیف                | `useAssignmentsPageData` تکراری                        | ✅ هوک واحد `useAssignmentLookups` (کاربران/ارسال‌ها/کلاس‌ها + آمار تصحیح)      |
| Lazy Loading                 | بارگذاری کامل                                          | ✅ مسیرها با `lazy()` + `Suspense` در `AppRoutes`                              |
| بیلد و کیفیت کد              | esbuild minify                                         | ✅ **oxc minify** + **lightningcss** + chunk splitting + `--deny-warnings`     |

### 🎨 رابط کاربری و تجربه کاربری (UX)

| مورد                       | نسخه 3.9.7 | نسخه 5.0.0                                |
| :------------------------- | :--------- | :---------------------------------------- |
| کارت‌های موبایل            | بخشی از جداول | ✅ `EmptyListState` (تفکیک حالت خالی/پیدانشدن) در لیست‌ها |
| نشانگر ددلاین              | ساده       | ✅ `DeadlineBadge` با رنگ‌بندی خودکار      |
| آمار تصحیح تکالیف          | داخلی      | ✅ `StudentGradeCard` + آمار `graded/total` در جدول استاد |
| انتخاب جلسه/کلاس           | تکراری     | ✅ کامپوننت مشترک `AttendanceClassSessionSelector` |

### 🛠 ابزارها و دستورات

| مورد              | نسخه 3.9.7         | نسخه 5.0.0                              |
| :---------------- | :----------------- | :-------------------------------------- |
| Scripts           | `dev`, `build`, `lint` | ✅ افزوده: `lint:check`, `typecheck`, `check`, `preview` |
| Pre-commit Hook   | Husky (typecheck + lint) | ✅ حفظ‌شده با oxlint سخت‌گیرانه (`--deny-warnings`) |
| وابستگی‌ها (Deps) | React 19.3.1, Vite 8.3.5 | ✅ آپدیت کامل (oxlint 1.90, oxc, lightningcss, Husky 9.1.7) |

</div>

---

<div dir="rtl">

## 🗺 نقشه راه توسعه (Development Roadmap)

فرآیند توسعه این سامانه بر اساس اصل **Dependency-Driven Development** فازبندی شده است؛ به‌گونه‌ای که هر فاز، پیش‌نیاز فاز بعدی را تأمین می‌کند و از وابستگی‌های معکوس جلوگیری می‌شود.

### ✅ فازهای هسته — تکمیل شده

| فاز | عنوان                               | وضعیت   | خلاصه پیاده‌سازی                                                                                         |
| :-: | :---------------------------------- | :-----: | :-------------------------------------------------------------------------------------------------------- |
|  ۱  | پایه فنی و اسکلت پروژه              | ✅ تکمیل | React + TS + Vite + Tailwind، لایه سرویس `baseApi`، کامپوننت‌های پایه، تایپ‌های کامل، `db.json`          |
|  ۲  | احراز هویت، نقش‌ها و کنترل دسترسی   | ✅ تکمیل | `AuthProvider`, `LoginPage`, `ProtectedRoute`, `RoleGuard`, ذخیره نشست بدون رمز، `isValidUser`            |
|  ۳  | مدیریت کاربران                      | ✅ تکمیل | CRUD کاربر، فیلتر/جستجو، جزئیات، محافظت از آخرین مدیر، حذف آبشاری، ایمیل یکتا                          |
|  ۴  | کلاس‌ها و جلسات                     | ✅ تکمیل | CRUD کلاس، `SearchableMultiSelect`، جلسات، حذف آبشاری، فعال/غیرفعال‌سازی، جزئیات کلاس                  |
|  ۵  | حضور و غیاب (نقش‌محور)              | ✅ تکمیل | ارکستراتور + ۳ نمای نقش، عملیات گروهی، آمار/درصد، گزارش فقط‌مطالعه‌ی مدیر                               |
|  ۶  | اطلاعیه‌ها                          | ✅ تکمیل | کارت/مدال، مخاطب‌گذاری کلاس/نقش، وضعیت مشاهده، مجوزهای نقش، `isAnnouncementVisibleTo`                  |
|  ۷  | تکالیف و ارزیابی                    | ✅ تکمیل | فرم با ددلاین، ارسال/ویرایش پاسخ، نمره‌دهی ۰ تا ۲۰، بازخورد، برگشت برای اصلاح، نمره‌ی خودکار ۰          |
|  ۸  | داشبوردهای اختصاصی                  | ✅ تکمیل | `DashboardContainer` نقش‌محور + ۳ داشبورد با نمودارهای Recharts و کامپوننت‌های مشترک                     |
|  ۹  | یکپارچه‌سازی و UX ضروری             | ✅ تکمیل | مدیریت خطا (ApiError + ErrorBoundary)، Toast، دسترس‌پذیری، ریسپانسیو، فونت وزیرمتن                    |
| ۱۰  | تست، رفع باگ و آماده‌سازی ارائه     | ✅ تکمیل | `db.json` نهایی با داده‌های دمو و سناریوهای تست                                                          |
| ۱۱  | ★ کلاس‌های منِ دانشجو               | ✅ تکمیل | `StudentClassesPage` + نشان ظرفیت رنگی + مسیر `my-classes` و `classes/:id`                               |
| ۱۲  | ★ معماری ماژولار هوک‌ها و ثابت‌ها   | ✅ تکمیل | ماژولارسازی `constants`, هوک‌های `use*Page`, `useFilter`, `useCrudPage`, تفکیک نقش‌محور تکالیف            |
| ۱۳  | ★ بازسازی بنیادین معماری (۵.۰.۰)    | ✅ تکمیل | ماژولارسازی کامپوننت‌ها/آیکون‌ها/تایپ‌ها، `ApiError`, `cascadeDelete`، `useAssignmentLookups`, Lazy Loading |

### 🔸 فازهای توسعه‌ای — در انتظار اجرا

| فاز | عنوان                          | وضعیت | اولویت | توضیحات                                                                     |
| :-: | :----------------------------- | :---: | :----: | :-------------------------------------------------------------------------- |
| ۱۴  | مرکز اعلان‌ها (Notification)   | ⏳    | بالا   | اعلان‌های خوانده‌نشده، `mark as read`, هشدار ددلاین نزدیک                   |
| ۱۵  | وضعیت‌ها و آرشیو               | ⚠️    | بالا   | سیستم کامل `Draft/Published/Archived` و آرشیو اطلاعیه/تکلیف                  |
| ۱۶  | تقویم آموزشی و یادآورها        | ⚠️    | متوسط | نمایش بصری جلسات و ددلاین‌ها روی تقویم                                      |
| ۱۷  | اتاق گفتگوی آموزشی (Discussion)| ⏳    | متوسط | چت کلاسی، ارسال پیام، `seen/unseen`                                         |
| ۱۸  | تکمیل ثبت‌نام در کلاس          | ⏳    | متوسط | منطق واقعی ثبت‌نام/ورود دانشجو به کلاس                                      |
| ۱۹  | پروفایل پیشرفته و Activity Log | ⚠️    | متوسط | آواتار، تاریخچه فعالیت‌ها و اطلاعات تکمیلی                                   |
| ۲۰  | سیستم آزمون‌ساز آنلاین          | ⏳    | پایین  | ساخت آزمون، سوالات تستی/تشریحی، تصحیح و نمره‌دهی                            |
| ۲۱  | بهبودهای رزومه‌ای نهایی         | ⏳    | پایین  | حالت تاریک، جستجوی سراسری، شخصی‌سازی ویجت‌ها                                |

---

<div dir="rtl">

## 👨‍💻 توسعه‌دهنده

**محمد حیدری**

توسعه‌دهنده فرانت‌اند | علاقه‌مند به معماری نرم‌افزار، تجربه کاربری و تکنولوژی‌های نوین وب

---

_طراحی، معماری و پیاده‌سازی شده با ❤️ | مبتنی بر اکوسیستم React و TypeScript_

**نسخه: 5.0.0** | **لایسنس: MIT** | **آخرین به‌روزرسانی: آذر ۱۴۰۵**

</div>