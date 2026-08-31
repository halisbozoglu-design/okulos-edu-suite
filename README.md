# OkulOS: School Hub

Build a Mobile-First Educational ERP System named "OkulOS" using React, Tailwind CSS, and shadcn/ui. 

Design System: Primary color indigo-600, background gray-50. Professional, clean, and minimalist.

Generate the initial UI shell with these 3 screens (mock data only, no real backend connection yet):

1. Auth/Onboarding Screen: A minimalist centered card. Inputs for "National ID (Last 4 digits)" and "Email". Two side-by-side dropdowns for Blood Type (A, B, AB, O) and Rh factor (+, -). A primary full-width button: "Complete Registration & Enable Notifications".

2. Teacher Dashboard: Mobile-first layout. Header with greeting, role badge, and notification bell. A prominent red "REPORT CRISIS / ABSENCE" button. Two quick status widgets (Today's Summary, Duty Status). A tabbed navigation for [Weekly Schedule], [Payroll], and [Documents].

3. Admin Substitute Manager: A layout showing a list of absent teachers with dummy data, and a smart action button "Assign Substitutes" with a clean list of available duty teachers.

Please keep the components highly modular and strictly UI-focused. Do not add complex backend logic yet.

Please keep the components highly modular and strictly UI-focused.

Build the next 3 core UI modules for the "OkulOS" Educational ERP System. 

Maintain the same Design System: Mobile-first, Tailwind CSS, shadcn/ui, Primary color indigo-600, background gray-50.

Generate the following strictly UI-focused screens (use mock data, no backend logic):

1. Payroll (Ek Ders) Grid View: A comprehensive data table for monthly extra tuition hours. 

   - Sticky left columns for: S.No, Teacher Name, Role.

   - Dynamic columns for days 1 to 31.

   - Each teacher row should be expandable to show sub-categories: "Gündüz", "Nöbet", "Rehberlik".

   - Include an "Export to Excel (KBS)" action button at the top.

2. Class & Student Management (e-Okul Import): 

   - A top section with an "Upload PDF/Excel" dropzone for importing e-Okul class lists.

   - A card-based list or table showing imported classes with composite keys (e.g., "9/A - FEN", "9/A - IHP").

   - Include columns for: Class Name, Program Type, and Student Count. 

   - Add a visual alert icon if a class exceeds 25 students (for group splitting).

3. Settings & Duty Rotation (İdareci Nöbet Rotasyonu):

   - A clean form to define Vice Principals and assign their duty days.

   - A visual timeline or calendar view showing the monthly rotation loop.

   - An "Auto-fill Month" (Aylık Otomatik Doldur) smart button to generate the rotation automatically.

Ensure all tables are responsive with horizontal scrolling for smaller screens.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://okulos-edu-suite.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8b874ff1-ec9d-429d-a434-78fc22c88300).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
