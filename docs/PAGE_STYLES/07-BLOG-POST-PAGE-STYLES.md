# Blog Post Page Style Documentation

This document follows the visual flow of individual blog post pages from top to bottom. This page displays the full article content with related posts and sharing features.

**Note:** Blog functionality is hidden by default and controlled by admin settings. Only accessible when `showBlog` is enabled.

## Navigation Bar
*Same as homepage - see 08-NAVIGATION-FOOTER-STYLES.md for details*

---

## Breadcrumb Navigation
*Shows navigation path to current article*

### Breadcrumb Container
**Current:**
- Background: Gray-50
- Padding: 16px top and bottom
- Border bottom: Gray-200, 1px

**New:**

### Breadcrumb Content
**Current:**
- Max width: 1024px (4xl)
- Centered with auto margins
- Layout: Flex items center with 8px gaps
- Font size: sm (14px)
- Color: Gray-600

**New:**

#### Breadcrumb Links
**Current:**
- Home link: Links to industry path
- Blog link: Links to blog listing page
- Current: Shows post category in gray-900
- Separators: "/" between items
- Hover: Color changes to primary

**New:**

---

## Article Header
*Main article title and metadata section*

### Header Container
**Current:**
- Background: White
- Padding: 64px top and bottom

**New:**

### Header Content
**Current:**
- Animation: Fade up from 20px on load
- Duration: 0.8s
- Max width: 1024px (4xl)
- Centered with auto margins

**New:**

#### Category and Read Time
**Current:**
- Layout: Flex items center with 8px gap
- Margin: 24px bottom

**New:**

##### Category Badge
**Current:**
- Background: Primary
- Text color: White
- Padding: 16px horizontal, 8px vertical
- Border radius: Full (pill)
- Font size: sm (14px)
- Font weight: Medium (500)

**New:**

##### Read Time Label
**Current:**
- Color: Gray-500
- Font size: sm (14px)
- Format: "[X] min read"

**New:**

#### Article Title
**Current:**
- Font size: 4xl on mobile, 5xl on desktop (36px/48px)
- Font weight: Bold (700)
- Color: Gray-900
- Margin: 24px bottom
- Line height: Tight

**New:**

#### Article Excerpt
**Current:**
- Font size: xl (20px)
- Color: Gray-600
- Margin: 32px bottom
- Line height: Relaxed

**New:**

### Author and Share Section
**Current:**
- Layout: Flex items center, justify between

**New:**

#### Author Information
**Current:**
- Layout: Flex items center with 16px gap

**New:**

##### Author Avatar
**Current:**
- Size: 64px x 64px (w-16 h-16)
- Border radius: Full (circle)
- Object fit: Cover

**New:**

##### Author Details
**Current:**
- Layout: Flex column

**New:**

###### Author Name
**Current:**
- Font weight: Bold (700)
- Color: Gray-900
- Font size: lg (18px)

**New:**

###### Author Title
**Current:**
- Color: Gray-600
- Font size: Base (16px)

**New:**

###### Publish Date
**Current:**
- Color: Gray-500
- Font size: sm (14px)
- Format: "Month Day, Year"

**New:**

#### Share Button
**Current:**
- Position: Relative
- Layout: Flex items center with 8px gap
- Background: Gray-100
- Hover background: Gray-200
- Padding: 16px horizontal, 8px vertical
- Border radius: lg (8px)
- Transition: Colors

**New:**

##### Share Icon
**Current:**
- Size: 20px x 20px (w-5 h-5)
- Stroke: Current color
- Path: Share/network icon

**New:**

##### Share Menu (When Open)
**Current:**
- Position: Absolute, top 48px, right 0
- Background: White
- Border radius: lg (8px)
- Shadow: lg (large drop shadow)
- Border: Gray-200, 1px
- Padding: 8px vertical
- Z-index: 10

**New:**

###### Share Option (Individual)
**Current:**
- Layout: Flex items center with 12px gap
- Width: Full
- Padding: 16px horizontal, 8px vertical
- Hover background: Gray-50
- Text alignment: Left

**New:**

####### Share Platform Icons
**Current:**
- Twitter: "𝕏" (text-blue-500)
- LinkedIn: "in" (text-blue-700)
- Facebook: "f" (text-blue-600)
- Email: "✉" (text-gray-600)
- Copy Link: "🔗" (text-gray-600)

**New:**

---

## Featured Image
*Large hero image for the article*

### Featured Image Container
**Current:**
- Aspect ratio: Video (16:9)
- Max width: 1536px (6xl)
- Centered with auto margins
- Padding: 16px on mobile, 24px on tablet, 32px on desktop
- Margin: 48px bottom

**New:**

### Featured Image
**Current:**
- Width: Full
- Height: Full
- Object fit: Cover
- Border radius: 2xl (16px)
- Shadow: lg (large drop shadow)
- Alt text: Article title

**New:**

---

## Article Content
*Main article body with formatted content*

### Content Container
**Current:**
- Max width: 1024px (4xl)
- Centered with auto margins
- Padding: 16px on mobile, 24px on tablet, 32px on desktop
- Margin: 64px bottom

**New:**

### Content Wrapper
**Current:**
- Animation: Fade up from 20px with 0.2s delay
- Duration: 0.8s
- Prose styling: prose-lg, max-w-none
- Font size: lg (18px)
- Line height: Relaxed

**New:**

#### Content Formatting (Markdown-like)
**Current:**
- H1 headings: 4xl (36px), bold, gray-900, 24px bottom margin, 32px top margin (except first)
- H2 headings: 3xl (30px), bold, gray-900, 16px bottom margin, 32px top margin
- H3 headings: 2xl (24px), bold, gray-900, 16px bottom margin, 24px top margin
- Paragraphs: Gray-700, 16px bottom margin, leading-relaxed
- Bold text: `**text**` → `<strong>text</strong>`
- Italic text: `*text*` → `<em>text</em>`
- Inline code: `` `code` `` → styled with gray background

**New:**

#### Lists
**Current:**
- Unordered lists: Disc bullets, inside positioning, gray-700, 24px bottom margin, 16px left margin, 8px spacing between items
- Ordered lists: Decimal numbers, inside positioning, gray-700, 24px bottom margin, 16px left margin, 8px spacing between items

**New:**

#### Images in Content
**Current:**
- Width: Full
- Max width: 512px (2xl)
- Centered with auto margins
- Height: Auto
- Object fit: Contain
- Border radius: lg (8px)
- Margin: 24px vertical
- Max height: 70vh

**New:**

### Tags Section
**Current:**
- Margin: 48px top, 32px bottom padding
- Border top: Gray-200, 1px

**New:**

#### Tags Header
**Current:**
- Text: "Tags"
- Font size: lg (18px)
- Font weight: Semibold (600)
- Color: Gray-900
- Margin: 16px bottom

**New:**

#### Tags List
**Current:**
- Layout: Flex wrap with 8px gaps

**New:**

##### Individual Tag
**Current:**
- Background: Gray-100
- Hover background: Gray-200
- Text color: Gray-700
- Padding: 12px horizontal, 4px vertical
- Border radius: Full (pill)
- Font size: sm (14px)
- Cursor: Pointer
- Transition: Colors

**New:**

---

## Author Bio Section
*Enhanced author information card*

### Author Bio Container
**Current:**
- Background: Gray-50
- Padding: 64px top and bottom

**New:**

### Author Bio Card
**Current:**
- Animation: Fade up from 20px on scroll into view
- Duration: 0.6s
- Viewport trigger: Once only
- Max width: 1024px (4xl)
- Centered with auto margins
- Background: White
- Border radius: 2xl (16px)
- Padding: 32px
- Shadow: lg (large drop shadow)

**New:**

#### Author Bio Layout
**Current:**
- Layout: Flex items start with 24px gap

**New:**

##### Author Bio Avatar
**Current:**
- Size: 96px x 96px (w-24 h-24)
- Border radius: Full (circle)
- Object fit: Cover
- Flex: Shrink-0

**New:**

##### Author Bio Content
**Current:**
- Flex: 1 (takes remaining space)

**New:**

###### Author Bio Name
**Current:**
- Font size: 2xl (24px)
- Font weight: Bold (700)
- Color: Gray-900
- Margin: 8px bottom

**New:**

###### Author Bio Title
**Current:**
- Color: Primary
- Font weight: Medium (500)
- Margin: 16px bottom

**New:**

###### Author Bio Description
**Current:**
- Text: "Laurie Meiring is the founder of Inteligencia, bringing over 15 years of experience in digital marketing with specialization in industry-specific strategies. She helps businesses build sustainable growth through proven marketing frameworks and data-driven insights."
- Color: Gray-600
- Margin: 24px bottom

**New:**

###### Author Bio Buttons
**Current:**
- Layout: Flex with 16px gap

**New:**

####### Learn More Button
**Current:**
- Background: Primary
- Text color: White
- Padding: 16px horizontal, 8px vertical
- Border radius: lg (8px)
- Hover: Opacity 90%
- Transition: Opacity
- Text: "Learn More"
- Link: About page

**New:**

####### Contact Button
**Current:**
- Border: Gray-300, 1px
- Text color: Gray-700
- Padding: 16px horizontal, 8px vertical
- Border radius: lg (8px)
- Hover background: Gray-50
- Transition: Colors
- Text: "Get In Touch"
- Link: Contact page

**New:**

---

## Related Posts Section
*Shows up to 3 related articles*

### Related Posts Visibility
**Current:**
- Only shows if relatedPosts.length > 0
- Related posts found by matching category or shared tags
- Limited to 3 posts

**New:**

### Related Posts Container
**Current:**
- Background: White
- Padding: 80px top and bottom

**New:**

### Related Posts Header
**Current:**
- Animation: Fade up from 20px on scroll into view
- Duration: 0.6s
- Viewport trigger: Once only
- Text alignment: Center
- Margin: 64px bottom

**New:**

#### Related Posts Title
**Current:**
- Text: "Related Articles"
- Font size: 4xl (36px)
- Font weight: Bold (700)
- Color: Gray-900
- Margin: 24px bottom

**New:**

#### Related Posts Subtitle
**Current:**
- Text: "Continue reading with these related insights"
- Font size: xl (20px)
- Color: Gray-600

**New:**

### Related Posts Grid
**Current:**
- Layout: 1 column on mobile, 3 columns on desktop
- Gap: 32px between cards

**New:**

### Related Post Card (Individual)
**Current:**
- Animation: Fade up from 20px with stagger (0.1s delay per card)
- Duration: 0.6s
- Viewport trigger: Once only
- Background: White
- Border radius: 2xl (16px)
- Shadow: lg (large drop shadow)
- Overflow: Hidden
- Hover shadow: xl (extra large)
- Transition: Shadow, 0.3s duration

**New:**

#### Related Post Link
**Current:**
- Element: Link to related post
- URL format: `${industryPath}/blog/${relatedPost.slug}`

**New:**

##### Related Post Image
**Current:**
- Aspect ratio: Video (16:9)
- Overflow: Hidden
- Image: Full size, cover fit, hover scale 105%, 0.3s transition

**New:**

##### Related Post Content
**Current:**
- Padding: 24px

**New:**

###### Related Post Meta
**Current:**
- Layout: Flex items center with 8px gap
- Margin: 12px bottom

**New:**

####### Related Post Category
**Current:**
- Background: Primary
- Text color: White
- Padding: 12px horizontal, 4px vertical
- Border radius: Full (pill)
- Font size: sm (14px)
- Font weight: Medium (500)

**New:**

####### Related Post Read Time
**Current:**
- Color: Gray-500
- Font size: sm (14px)

**New:**

###### Related Post Title
**Current:**
- Font size: xl (20px)
- Font weight: Bold (700)
- Color: Gray-900
- Margin: 12px bottom
- Hover: Color primary
- Transition: Colors

**New:**

###### Related Post Excerpt
**Current:**
- Color: Gray-600
- Margin: 16px bottom
- Content: Truncated to 120 characters + "..."

**New:**

###### Related Post Date
**Current:**
- Font size: sm (14px)
- Color: Gray-500
- Format: "Month Day, Year"

**New:**

---

## Call to Action Section
*Marketing consultation CTA*

### CTA Container
**Current:**
- Background: Gray-900
- Text color: White
- Padding: 80px top and bottom
- Text alignment: Center

**New:**

### CTA Content
**Current:**
- Animation: Fade up from 20px on scroll into view
- Duration: 0.6s
- Viewport trigger: Once only
- Max width: 1024px (4xl)
- Centered with auto margins

**New:**

#### CTA Title
**Current:**
- Text: "Ready to Transform Your Marketing?"
- Font size: 4xl (36px)
- Font weight: Bold (700)
- Margin: 24px bottom

**New:**

#### CTA Description
**Current:**
- Text: "Get personalized marketing strategies that drive real results for your [industry] business."
- Font size: xl (20px)
- Color: Gray-300
- Margin: 32px bottom

**New:**

### CTA Buttons
**Current:**
- Layout: Flex column on mobile, row on desktop
- Gap: 16px between buttons
- Justify: Center

**New:**

#### Primary CTA Button
**Current:**
- Background: Primary
- Hover background: Primary with 90% opacity
- Text color: White
- Padding: 32px horizontal, 16px vertical
- Border radius: lg (8px)
- Font weight: Bold (700)
- Font size: lg (18px)
- Transition: Colors
- Text: "Get Free Consultation"
- Link: "/contact"

**New:**

#### Secondary CTA Button
**Current:**
- Border: 2px solid white
- Text color: White
- Hover background: White
- Hover text color: Gray-900
- Padding: 32px horizontal, 16px vertical
- Border radius: lg (8px)
- Font weight: Bold (700)
- Font size: lg (18px)
- Transition: Colors
- Text: "View Success Stories"
- Link: Case studies page

**New:**

---

## Footer (Blog-Specific)
*Custom footer for blog posts*

### Footer Container
**Current:**
- Background: Black
- Text color: White
- Padding: 48px top and bottom

**New:**

### Footer Content Grid
**Current:**
- Layout: 1 column on mobile, 4 columns on desktop
- Gap: 32px between sections

**New:**

#### Company Info Column
**Current:**
- Brand name: "Inteligencia" (2xl, bold, 16px bottom margin)
- Description: "Expert marketing insights for [industry]." (gray-400, 16px bottom margin)

**New:**

#### Quick Links Column
**Current:**
- Header: "Quick Links" (bold, 16px bottom margin)
- Links: Home, Services, About, Case Studies (gray-400, hover white)

**New:**

#### Blog Column
**Current:**
- Header: "Blog" (bold, 16px bottom margin)
- Links: All Articles, Marketing Tips, Industry Insights, Case Studies (all link to blog)

**New:**

#### Contact Column
**Current:**
- Header: "Contact" (bold, 16px bottom margin)
- Email: "laurie@inteligenciadm.com"
- Phone: "+506 6200 2747"
- Get Started button: Primary background, white text

**New:**

### Footer Bottom
**Current:**
- Border top: Gray-800, 32px top margin, 32px top padding
- Text: Center aligned, gray-400
- Copyright: "© 2025 Inteligencia. All rights reserved."

**New:**

---

## Error State (Article Not Found)
*Displays when blog post slug doesn't exist*

### Error Container
**Current:**
- Min height: 100vh
- Layout: Flex items center justify center

**New:**

### Error Content
**Current:**
- Text alignment: Center

**New:**

#### Error Title
**Current:**
- Text: "Article Not Found"
- Font size: 4xl (36px)
- Font weight: Bold (700)
- Color: Gray-900
- Margin: 16px bottom

**New:**

#### Error Description
**Current:**
- Text: "The article you're looking for doesn't exist."
- Color: Gray-600
- Margin: 32px bottom

**New:**

#### Error Button
**Current:**
- Background: Primary
- Text color: White
- Padding: 24px horizontal, 12px vertical
- Border radius: lg (8px)
- Font weight: Medium (500)
- Hover: Opacity 90%
- Text: "Browse All Articles"
- Link: Blog listing page

**New:**

---

## Interactive Features Notes

### Share Functionality
- Twitter: Opens popup window with pre-filled tweet
- LinkedIn: Opens LinkedIn share dialog
- Facebook: Opens Facebook share dialog  
- Email: Opens default email client with subject and body
- Copy Link: Uses Clipboard API with success alert

### Content Processing
- Markdown-like syntax converted to HTML elements
- Inline formatting: **bold**, *italic*, `code`
- Headers: # H1, ## H2, ### H3
- Lists: - for bullets, 1. for numbers
- Images: ![alt](url) syntax supported

### Related Posts Algorithm
- Matches by category first
- Falls back to shared tags
- Excludes current post
- Limited to first 3 matches

## Responsive Behavior Notes

### Mobile (Under 640px)
- Author info and share button stack vertically
- Related posts show single column
- CTA buttons stack vertically
- Footer shows single column

### Tablet (640px - 1024px)
- Most layouts maintain desktop structure
- Related posts may show fewer columns

### Desktop (1024px+)
- Full layouts with proper spacing
- Share menu positioned correctly
- All hover effects active
- Optimal typography scaling