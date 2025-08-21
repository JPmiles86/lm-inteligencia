# Contact Page Style Documentation

This document follows the visual flow of the Contact page from top to bottom. This page features a comprehensive contact form, multiple contact methods, and FAQ section.

## Navigation Bar
*Same as homepage - see 08-NAVIGATION-FOOTER-STYLES.md for details*

---

## Hero Section
*Full-width gradient header introducing the contact page*

### Hero Container
**Current:**
- Background: Gradient from gray-900 through blue-900 to gray-900
- Overlay: Black with 20% opacity
- Text color: White
- Padding: 80px top and bottom
- Position: Relative

**New:**

### Hero Content
**Current:**
- Animation: Fade up from 20px on load
- Duration: 0.8s
- Max width: 1280px (7xl)
- Centered with auto margins
- Text alignment: Center

**New:**

#### Hero Title
**Current:**
- Text: From config or "Get Started Today"
- Font size: 5xl on mobile, 6xl on desktop (48px/60px)
- Font weight: Bold (700)
- Color: White
- Margin: 24px bottom

**New:**

#### Hero Subtitle
**Current:**
- Text: From config or industry-specific message
- Font size: xl (20px)
- Color: Gray-300
- Margin: 32px bottom
- Max width: 1024px (4xl)
- Centered with auto margins

**New:**

---

## Contact Form & Information Section
*Two-column layout with form and contact methods*

### Section Container
**Current:**
- Background: White
- Padding: 80px top and bottom

**New:**

### Main Content Grid
**Current:**
- Layout: 1 column on mobile, 2 columns on desktop (lg:grid-cols-2)
- Gap: 48px between columns

**New:**

### Contact Form (Left Column)
**Current:**
- Animation: Slide in from left (-50px) on scroll into view
- Duration: 0.8s
- Viewport trigger: Once only
- Background: Gray-50
- Border radius: 2xl (16px)
- Padding: 32px

**New:**

#### Form Header
**Current:**
- Title: From config or "Send us a message"
- Title font size: 3xl (30px)
- Title font weight: Bold (700)
- Title color: Gray-900
- Title margin: 24px bottom

**New:**

#### Form Subtitle
**Current:**
- Text: From config or default description
- Color: Gray-600
- Margin: 32px bottom

**New:**

#### Form Fields Container
**Current:**
- Form spacing: 24px between field groups (space-y-6)
- Submit handler: Prevents default, shows alert

**New:**

##### Name Fields Row
**Current:**
- Layout: 1 column on mobile, 2 on tablet (sm:grid-cols-2)
- Gap: 24px between fields

**New:**

###### First Name Field
**Current:**
- Label: From config or "First Name *"
- Label styles: sm size, medium weight, gray-700, 8px bottom margin
- Input: Full width, 16px horizontal + 12px vertical padding
- Input border: Gray-300, 1px
- Input border radius: lg (8px)
- Input focus: Ring-2 ring-primary, border transparent
- Input transition: Colors
- Placeholder: From config or "Enter your first name"
- Required: True

**New:**

###### Last Name Field
**Current:**
- Same styling as First Name
- Label: From config or "Last Name *"
- Placeholder: From config or "Enter your last name"

**New:**

##### Contact Info Row
**Current:**
- Same grid layout as name fields

**New:**

###### Email Field
**Current:**
- Type: Email
- Required: True
- Label: From config or "Email Address *"
- Placeholder: From config or "your@email.com"
- Same input styling as name fields

**New:**

###### Phone Field
**Current:**
- Type: Tel
- Required: False
- Label: From config or "Phone Number"
- Placeholder: From config or "+506 6200 2747"
- Same input styling as name fields

**New:**

##### Business Name Field
**Current:**
- Type: Text
- Required: True
- Label: From config or "Business Name *"
- Placeholder: From config or "Your Business Name"
- Full width field
- Same input styling

**New:**

##### Business Type Field
**Current:**
- Type: Select dropdown
- Required: True
- Label: From config or "Business Type *"
- Default option: From config or "Select your business type"
- Options: Industry-specific business types array
- Same select styling as inputs

**New:**

###### Business Type Options by Industry
**Current:**
- Hospitality: Boutique Hotel, Resort, Restaurant, Fine Dining, etc.
- Healthcare: General Dentistry, Medical Practice, Health Clinic, etc.
- Tech: SaaS Startup, AI Company, MarTech Platform, etc.  
- Athletics: Pickleball Facility, Sports Club, Event Venue, etc.
- Main: Industry categories

**New:**

##### Budget & Timeline Row
**Current:**
- Same grid layout as other rows

**New:**

###### Budget Range Field
**Current:**
- Type: Select dropdown
- Required: False
- Label: From config or "Marketing Budget"
- Default option: From config or "Select your budget range"
- Options: $1K-$2.5K, $2.5K-$5K, $5K-$10K, $10K+, Let's discuss

**New:**

###### Timeline Field
**Current:**
- Type: Select dropdown
- Required: False
- Label: From config or "Timeline"
- Default option: From config or "When do you want to start?"
- Options: ASAP, Within 1 month, 1-3 months, 3-6 months, Just exploring

**New:**

##### Marketing Goals Field
**Current:**
- Type: Textarea
- Required: True
- Rows: 3
- Label: From config or "What are your main marketing goals? *"
- Placeholder: From config or example goals
- Same styling as inputs

**New:**

##### Additional Details Field
**Current:**
- Type: Textarea
- Required: False
- Rows: 4
- Label: From config or "Additional Details"
- Placeholder: From config or business details prompt
- Same styling as inputs

**New:**

##### Submit Button
**Current:**
- Type: Submit
- Width: Full
- Background: Gradient from pink-500 to rose-500
- Hover: From pink-600 to rose-600
- Text color: White
- Font weight: Bold (700)
- Padding: 16px vertical
- Border radius: lg (8px)
- Font size: lg (18px)
- Transition: All properties
- Transform: Scale 105% on hover
- Text: From config or "Send Message & Get Free Consultation"

**New:**

##### Privacy Notice
**Current:**
- Text: From config or privacy message
- Font size: sm (14px)
- Color: Gray-500
- Text alignment: Center

**New:**

### Contact Information (Right Column)
**Current:**
- Animation: Slide in from right (50px) on scroll into view
- Duration: 0.8s
- Viewport trigger: Once only
- Spacing: 32px between sections (space-y-8)

**New:**

#### Contact Info Header
**Current:**
- Title: From config or "Get in Touch"
- Title font size: 3xl (30px)
- Title font weight: Bold (700)
- Title color: Gray-900
- Title margin: 24px bottom

**New:**

#### Contact Info Subtitle
**Current:**
- Text: From config or industry-specific message
- Font size: lg (18px)
- Color: Gray-600
- Margin: 32px bottom

**New:**

#### Contact Methods List
**Current:**
- Spacing: 24px between methods (space-y-6)
- Filters out "Office" method type

**New:**

##### Contact Method Card (Individual)
**Current:**
- Element: Anchor tag with appropriate href
- Background: Gray-50
- Border radius: xl (12px)
- Padding: 24px
- Hover: Background gray-100
- Transition: Colors
- Cursor: Pointer
- Layout: Flex items start

**New:**

###### Method Icon
**Current:**
- Margin: 16px right
- Icon handling: Image (48px x 48px) for SVG paths, text (3xl) for emojis

**New:**

###### Method Content
**Current:**
- Flex: 1 (takes remaining space)

**New:**

####### Method Title
**Current:**
- Font size: xl (20px)
- Font weight: Bold (700)
- Color: Gray-900
- Margin: 8px bottom

**New:**

####### Method Value
**Current:**
- Color: Primary
- Font weight: Medium (500)
- Margin: 8px bottom
- Content: Email, phone, or contact value

**New:**

####### Method Description
**Current:**
- Color: Gray-600
- Font size: sm (14px)

**New:**

##### Contact Method Types
**Current:**
- Email: mailto: link, "Email us anytime - we respond within 24 hours"
- Phone: tel: link, "Call us during business hours (9 AM - 6 PM EST)"
- WhatsApp: wa.me link with pre-filled message, target="_blank"

**New:**

#### Calendly Section
*Highlighted call-to-action for scheduling*

**Current:**
- Background: Gradient from primary (#371657) through purple (#9123d1) to gray-900
- Border radius: xl (12px)
- Padding: 32px
- Text color: White

**New:**

##### Calendly Title
**Current:**
- Text: From config or "Schedule a Free Consultation"
- Font size: 2xl (24px)
- Font weight: Bold (700)
- Margin: 16px bottom

**New:**

##### Calendly Description
**Current:**
- Text: "Book a 30-minute strategy session to discuss your marketing goals and learn how we can help grow your business."
- Color: Gray-200
- Margin: 24px bottom

**New:**

##### Calendly Button
**Current:**
- Width: Full
- Background: Gradient from pink-500 to rose-500
- Hover: From pink-600 to rose-600
- Text color: White
- Padding: 24px horizontal, 12px vertical
- Border radius: lg (8px)
- Font weight: Bold (700)
- Transition: All properties
- Transform: Scale 105% on hover
- Text: "Schedule Free Call"

**New:**

#### Office Hours Section (Hidden)
*Currently hidden per client request*

**Current:**
- Display: Hidden class applied
- Background: Gray-100
- Border radius: xl (12px)
- Padding: 24px

**New:**

---

## FAQ Section
*Frequently asked questions about the service*

### FAQ Container
**Current:**
- Background: Gray-50
- Padding: 80px top and bottom

**New:**

### FAQ Header
**Current:**
- Animation: Fade up from 20px on scroll into view
- Duration: 0.6s
- Viewport trigger: Once only
- Text alignment: Center
- Margin: 64px bottom

**New:**

#### FAQ Title
**Current:**
- Text: "Frequently Asked Questions"
- Font size: 4xl (36px)
- Font weight: Bold (700)
- Color: Gray-900
- Margin: 24px bottom

**New:**

#### FAQ Subtitle
**Current:**
- Text: Industry-specific description
- Font size: xl (20px)
- Color: Gray-600

**New:**

### FAQ Items List
**Current:**
- Spacing: 24px between questions (space-y-6)
- Max width: 1024px (4xl)
- Centered with auto margins

**New:**

### FAQ Item (Individual)
**Current:**
- Animation: Fade up from 20px with stagger (0.1s delay per item)
- Duration: 0.6s
- Viewport trigger: Once only
- Background: White
- Border radius: xl (12px)
- Padding: 24px
- Shadow: sm (small drop shadow)

**New:**

#### FAQ Question
**Current:**
- Font size: lg (18px)
- Font weight: Bold (700)
- Color: Gray-900
- Margin: 12px bottom

**New:**

#### FAQ Answer
**Current:**
- Color: Gray-600
- Line height: Normal

**New:**

#### Default FAQ Content
**Current:**
- "How quickly can I expect to see results?" - 30-60 days initial, 3-6 months significant
- "Do you work with businesses outside of these industries?" - Focus on specialization
- "What makes your approach different?" - Industry-specific insights
- "Do you require long-term contracts?" - Flexible arrangements available

**New:**

---

## Footer
*Same as homepage - see 08-NAVIGATION-FOOTER-STYLES.md for details*

---

## Form Behavior Notes

### Form Validation
- Required fields: First Name, Last Name, Email, Business Name, Business Type, Goals
- Email field has built-in email validation
- Phone field accepts telephone format
- Form prevents submission until all required fields completed

### Form State Management
- Uses React useState for all form fields
- Controlled components with value and onChange handlers
- Form data structure includes all field types
- Submit handler currently shows success alert

### Dynamic Content
- All labels can be customized per industry via config
- Placeholder text customizable per industry
- Business types array varies by industry
- Budget and timeline options consistent across industries

## Responsive Behavior Notes

### Mobile (Under 640px)
- Two-column grids become single column
- Form and contact info stack vertically
- Contact method cards maintain full width
- Form fields stack in single column for name/contact rows

### Tablet (640px - 1024px)
- Some two-column layouts maintain on tablet
- Form maintains two-column layout for field pairs
- Contact info may stack depending on content length

### Desktop (1024px+)
- Full two-column layout between form and contact info
- All field pairs show side-by-side
- All hover effects active
- Optimal spacing and typography sizes

## Animation Details
- Form slides in from left, contact info from right
- FAQ items animate with staggered timing
- All scroll-triggered animations use "once" viewport setting
- Smooth transitions on all interactive elements
- Form submission provides immediate feedback

## Contact Method Links
- Email opens default mail client with mailto: link
- Phone opens phone app with tel: link  
- WhatsApp opens in new tab with pre-filled message
- All external links have proper security attributes