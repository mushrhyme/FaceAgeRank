# Design Guidelines: Face Age Estimation Web Application

## Design Approach
**Selected System**: Material Design 3 with modern productivity influences (Linear, Notion)
**Rationale**: Utility-focused workflow application requiring clarity, trust, and step-by-step guidance. Users need confidence in a sensitive capture process (webcam access).

## Core Design Principles
- **Progressive Disclosure**: One clear action per screen
- **Trust & Transparency**: Professional aesthetic for workplace context
- **Guided Experience**: Clear visual feedback at each step
- **Accessibility**: High contrast, large touch targets (min 48px)

## Typography System
**Primary Font**: Inter (via Google Fonts CDN)
**Hierarchy**:
- Screen Titles: 2xl (24px), semibold
- Primary Actions: lg (18px), medium
- Body/Instructions: base (16px), regular
- Countdown Numbers: 6xl (60px), bold
- Results/Age Display: 5xl (48px), bold
- Supporting Text: sm (14px), regular

**Korean Language**: Ensure proper fallback with Noto Sans KR

## Layout & Spacing
**Spacing Primitives**: Tailwind units 2, 4, 8, 12, 16
- Component padding: p-8
- Section spacing: mb-12
- Button spacing: px-8 py-4
- Input fields: p-4
- Screen margins: p-16

**Layout Structure**: Single-column centered workflow
- Max width: max-w-2xl (672px) for forms
- Webcam container: max-w-4xl (896px)
- Center all content: mx-auto
- Full viewport height for each step: min-h-screen flex items-center justify-center

## Component Library

### 1. Login Screen (Step 1)
**Layout**: Centered card on neutral background
- Card container: rounded-2xl, shadow-xl, p-12
- Logo/title at top: mb-8
- Two input fields stacked: space-y-4
- Primary CTA button: full width, h-12
- Input fields: Full width, h-12, rounded-lg, border

### 2. Webcam Screen (Step 2)
**Layout**: Prominent camera feed
- Webcam viewport: Aspect ratio 4:3 or 16:9, rounded-xl
- Camera feed width: w-full max-w-3xl
- Start button: Positioned below camera, mt-8
- Status indicator: "Camera Active" badge, absolute top-4 right-4

### 3. Countdown Overlay (Step 3)
**Visual Treatment**: Full-screen overlay on camera feed
- Semi-transparent backdrop
- Countdown number: Center screen, scale animation
- Circle progress indicator around number (optional but recommended)
- Numbers: 3, 2, 1 with scale-in animation

### 4. Analysis Loading (Step 4)
**Layout**: Clean loading state
- Animated spinner/progress: Center screen
- "분석 중..." text: Below spinner, mt-4
- Subtle pulse animation on spinner

### 5. Results Screen (Step 5)
**Layout**: Celebration-style reveal
- Large age number display: Center top, text-6xl
- "당신의 얼굴 나이는" label above
- "살입니다" label below
- New attempt button: mt-12
- Captured photo thumbnail: Optional, rounded-full, w-32 h-32

## Navigation & Flow
**No Traditional Navigation**: Linear wizard flow only
- Back button: Only on webcam screen (top-left, subtle)
- Progress indicator: Not needed (clear linear steps)
- Restart/New attempt: Only on results screen

## Form Elements
**Input Fields**:
- Height: h-12
- Rounded: rounded-lg
- Labels: Above inputs, text-sm, mb-2
- Placeholders: Korean text, subtle opacity
- Focus states: Ring offset

**Buttons**:
- Primary height: h-12
- Full width on mobile, min-w-48 on desktop
- Rounded: rounded-lg
- Text: medium weight, letter-spacing-wide

## Animations
**Use Sparingly**:
- Countdown: Scale in/out (300ms)
- Screen transitions: Fade (200ms)
- Loading spinner: Continuous rotate
- NO hover effects on buttons (standard hover states only)

## Images
**No hero images needed** - This is a functional workflow application
**Webcam Feed**: Primary visual element, treat as the hero
**Optional branding**: Small company logo in header (h-8 to h-12)

## Accessibility
- Webcam permission prompt: Clear instructions in Korean
- Camera access denied state: Helpful error message with retry
- Loading states: Announce to screen readers
- All interactive elements: min 48px touch target
- Form validation: Inline error messages, text-sm, red accent

## Screen-Specific Notes
**Login**: Professional, minimal - avoid clutter
**Webcam**: Large preview builds confidence before capture
**Countdown**: Dramatic, clear - user knows when capture happens
**Loading**: Brief but reassuring - set expectations
**Results**: Celebratory but not childish - workplace appropriate

**Mobile Optimization**: All screens stack vertically, full-width containers with p-4 margins