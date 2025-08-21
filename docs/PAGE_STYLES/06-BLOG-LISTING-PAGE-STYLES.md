# Blog Listing Page Style Documentation

This document follows the visual flow of the Blog Listing page from top to bottom. This page displays all blog articles with search, filtering, and categorization features.

**Note:** Blog functionality is hidden by default and controlled by admin settings. Only visible when `showBlog` is enabled in admin panel.

## Navigation Bar
*Same as homepage - see 08-NAVIGATION-FOOTER-STYLES.md for details*
*Blog link only appears in navigation when admin enables blog functionality*

---

## Hero Section
*Full-width gradient header with blog statistics*

### Hero Container
**Current:**
- Background: Gradient from gray-900 through blue-900 to gray-900
- Overlay: Black with 20% opacity
- Text color: White
- Padding: 80px top and bottom
- Overflow: Hidden

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
- Text: "Marketing Insights & Strategies"
- Font size: 5xl on mobile, 6xl on desktop (48px/60px)
- Font weight: Bold (700)
- Color: White
- Margin: 24px bottom

**New:**

#### Hero Subtitle
**Current:**
- Text: "Expert insights, proven strategies, and industry-specific guidance to help your business thrive in the digital landscape."
- Font size: xl (20px)
- Color: Gray-300
- Margin: 32px bottom
- Max width: 768px (3xl)
- Centered with auto margins

**New:**

### Blog Statistics Grid
*Four stat cards showing blog metrics*

**Current:**
- Layout: 2 columns on mobile, 4 columns on desktop
- Gap: 32px between cards
- Max width: 1024px (4xl)
- Centered with auto margins

**New:**

#### Stat Card (Individual)
**Current:**
- Text alignment: Center

**New:**

##### Stat Number
**Current:**
- Font size: 3xl (30px)
- Font weight: Bold (700)
- Color: Secondary (#f04a9b)
- Margin: 8px bottom

**New:**

##### Stat Label
**Current:**
- Color: Gray-300
- Font size: Base (16px)

**New:**

#### Stat Examples
**Current:**
- Dynamic: Number of blog posts
- "4 Industries Covered"
- "15+ Years Experience"
- "100+ Success Stories"

**New:**

---

## Search and Filter Section
*Search bar and filtering controls*

### Filter Container
**Current:**
- Background: White
- Padding: 32px top and bottom
- Border bottom: Gray-200, 1px

**New:**

### Filter Content
**Current:**
- Layout: Flex column on mobile, row on desktop
- Gap: 16px between elements
- Items aligned: Center
- Justify: Between on desktop

**New:**

### Search Bar
**Current:**
- Flex: 1 (grows to fill space)
- Max width: 448px (max-w-md)
- Position: Relative

**New:**

#### Search Input
**Current:**
- Width: Full
- Padding: 40px left (for icon), 16px right, 8px vertical
- Border: Gray-300, 1px
- Border radius: lg (8px)
- Focus: Ring-2 ring-primary, border transparent
- Placeholder: "Search articles..."

**New:**

#### Search Icon
**Current:**
- Position: Absolute, left 12px, top centered
- Size: 20px x 20px (w-5 h-5)
- Color: Gray-400
- Path: Magnifying glass icon

**New:**

### Filter Controls
**Current:**
- Layout: Flex with 16px gap
- Contains category and sort dropdowns

**New:**

#### Category Filter Dropdown
**Current:**
- Padding: 16px horizontal, 8px vertical
- Border: Gray-300, 1px
- Border radius: lg (8px)
- Focus: Ring-2 ring-primary, border transparent
- Options: All, Hospitality Marketing, Health & Wellness Marketing, Tech & AI Marketing, Sports & Media Marketing

**New:**

#### Sort Filter Dropdown
**Current:**
- Same styling as category filter
- Options: "Newest First", "Oldest First", "Quick Reads"

**New:**

### Results Counter
**Current:**
- Margin: 16px top
- Font size: sm (14px)
- Color: Gray-600
- Format: "Showing X of Y articles"

**New:**

#### Clear Filters Link
**Current:**
- Shows when filters are active (search query or category ≠ "All")
- Margin: 8px left
- Color: Primary
- Hover: Underline
- Text: "Clear filters"

**New:**

---

## Featured Posts Section
*Only shows when "All" category is selected*

### Featured Section Container
**Current:**
- Background: Gray-50
- Padding: 80px top and bottom
- Conditional: Only renders when selectedCategory === 'All' and featuredPosts.length > 0

**New:**

### Featured Header
**Current:**
- Animation: Fade up from 20px on scroll into view
- Duration: 0.6s
- Viewport trigger: Once only
- Text alignment: Center
- Margin: 64px bottom

**New:**

#### Featured Title
**Current:**
- Text: "Featured Articles"
- Font size: 4xl (36px)
- Font weight: Bold (700)
- Color: Gray-900
- Margin: 24px bottom

**New:**

#### Featured Subtitle
**Current:**
- Text: "Our most popular and impactful marketing insights"
- Font size: xl (20px)
- Color: Gray-600
- Max width: 768px (3xl)
- Centered with auto margins

**New:**

### Featured Posts Grid
**Current:**
- Layout: 1 column on mobile, 2 on tablet, 3 on desktop
- Gap: 32px between cards
- Shows first 3 featured posts

**New:**

---

## Blog Posts Grid Section
*Main blog posts display area*

### Posts Section Container
**Current:**
- Background: White
- Padding: 80px top and bottom

**New:**

### Posts Grid (When Posts Exist)
**Current:**
- Layout: 1 column on mobile, 2 on tablet, 3 on desktop
- Gap: 32px between cards
- Animation: Fade in, 0.6s duration

**New:**

### No Results State (When No Posts)
**Current:**
- Text alignment: Center
- Padding: 64px vertical

**New:**

#### No Results Icon
**Current:**
- Text: "📝" (emoji)
- Font size: 6xl (60px)
- Margin: 16px bottom

**New:**

#### No Results Title
**Current:**
- Text: "No articles found"
- Font size: 2xl (24px)
- Font weight: Bold (700)
- Color: Gray-900
- Margin: 16px bottom

**New:**

#### No Results Description
**Current:**
- Text: "Try adjusting your search criteria or browse all articles."
- Color: Gray-600
- Margin: 32px bottom

**New:**

#### No Results Clear Button
**Current:**
- Background: Primary
- Text color: White
- Padding: 24px horizontal, 12px vertical
- Border radius: lg (8px)
- Font weight: Medium (500)
- Hover: Opacity 90%
- Text: "Clear Filters"

**New:**

---

## Blog Card Component
*Individual blog post card styling*

### Card Container
**Current:**
- Background: White
- Border radius: 2xl (16px)
- Shadow: lg (large drop shadow)
- Overflow: Hidden
- Transition: Shadow, 0.3s duration
- Featured cards: Span 2 columns on desktop (lg:col-span-2)

**New:**

### Card Link Wrapper
**Current:**
- Element: Link to blog post
- Display: Block
- URL format: `${industryPath}/blog/${post.slug}`

**New:**

#### Card Image
**Current:**
- Aspect ratio: Video (16:9)
- Featured aspect ratio: 2:1 on desktop
- Overflow: Hidden
- Position: Relative

**New:**

##### Blog Post Image
**Current:**
- Width: Full
- Height: Full
- Object fit: Cover
- Transition: Transform, 0.3s duration
- Hover: Scale 105%
- Loading: Lazy
- Alt text: Post title

**New:**

#### Card Content Container
**Current:**
- Padding: 24px

**New:**

##### Category and Read Time
**Current:**
- Layout: Flex items center with 8px gap
- Margin: 12px bottom

**New:**

###### Category Badge
**Current:**
- Background: Primary
- Text color: White
- Padding: 12px horizontal, 4px vertical
- Border radius: Full (pill)
- Font size: sm (14px)
- Font weight: Medium (500)

**New:**

###### Read Time Label
**Current:**
- Color: Gray-500
- Font size: sm (14px)
- Format: "[X] min read"

**New:**

##### Post Title
**Current:**
- Font weight: Bold (700)
- Color: Gray-900
- Margin: 12px bottom
- Hover: Color primary
- Transition: Colors
- Font size: xl (20px) normal, 2xl/3xl (24px/30px) if featured

**New:**

##### Post Excerpt
**Current:**
- Color: Gray-600
- Margin: 16px bottom
- Font size: Base (16px) normal, lg (18px) if featured

**New:**

##### Author and Date Row
**Current:**
- Layout: Flex items center, justify between

**New:**

###### Author Info
**Current:**
- Layout: Flex items center with 12px gap

**New:**

####### Author Avatar
**Current:**
- Size: 40px x 40px (w-10 h-10)
- Border radius: Full (circle)
- Object fit: Cover
- Background: Gray-200
- Error fallback: Base64 SVG avatar

**New:**

####### Author Details
**Current:**
- Layout: Flex column

**New:**

######## Author Name
**Current:**
- Font weight: Semibold (600)
- Color: Gray-900
- Font size: sm (14px)

**New:**

######## Author Title
**Current:**
- Color: Gray-600
- Font size: xs (12px)

**New:**

###### Publish Date
**Current:**
- Font size: sm (14px)
- Color: Gray-500
- Format: "Month Day, Year" (e.g., "January 15, 2024")

**New:**

##### Tags Container
**Current:**
- Layout: Flex wrap with 8px gaps
- Margin: 16px top
- Shows first 3 tags only

**New:**

###### Individual Tag
**Current:**
- Background: Gray-100
- Text color: Gray-700
- Padding: 8px horizontal, 4px vertical
- Border radius: Base (4px)
- Font size: xs (12px)

**New:**

---

## Newsletter Signup Section
*Email subscription call-to-action*

### Newsletter Container
**Current:**
- Background: Gradient from primary (#371657) through purple (#9123d1) to gray-900
- Text color: White
- Padding: 80px top and bottom

**New:**

### Newsletter Content
**Current:**
- Animation: Fade up from 20px on scroll into view
- Duration: 0.6s
- Viewport trigger: Once only
- Max width: 1024px (4xl)
- Centered with auto margins
- Text alignment: Center

**New:**

#### Newsletter Title
**Current:**
- Text: "Stay Updated with Marketing Insights"
- Font size: 4xl (36px)
- Font weight: Bold (700)
- Color: White
- Margin: 24px bottom

**New:**

#### Newsletter Description
**Current:**
- Text: "Get the latest marketing strategies, industry insights, and expert tips delivered directly to your inbox."
- Font size: xl (20px)
- Color: Gray-200
- Margin: 32px bottom

**New:**

### Newsletter Form
**Current:**
- Layout: Flex column on mobile, row on desktop
- Gap: 16px between elements
- Max width: 448px (max-w-md)
- Centered with auto margins

**New:**

#### Email Input
**Current:**
- Flex: 1 (grows to fill space)
- Padding: 16px horizontal, 12px vertical
- Border: Gray-300, 1px
- Border radius: lg (8px)
- Focus: Ring-2 ring-primary, border transparent
- Placeholder: "Enter your email"

**New:**

#### Subscribe Button
**Current:**
- Background: Gradient from pink-500 to rose-500
- Hover: From pink-600 to rose-600
- Text color: White
- Padding: 24px horizontal, 12px vertical
- Border radius: lg (8px)
- Font weight: Medium (500)
- Transition: All properties
- Transform: Scale 105% on hover
- Text: "Subscribe"

**New:**

#### Privacy Notice
**Current:**
- Font size: sm (14px)
- Color: Gray-300
- Margin: 16px top
- Contains link to privacy policy

**New:**

##### Privacy Link
**Current:**
- Color: Secondary
- Hover: Underline
- Text: "privacy policy"
- URL: "/privacy"

**New:**

---

## Footer
*Same as homepage - see 08-NAVIGATION-FOOTER-STYLES.md for details*

---

## State Management Notes

### Search Functionality
- Real-time search across: title, excerpt, tags, author name
- Case-insensitive matching
- No debouncing - immediate results

### Filter State
- Category filter: Defaults to industry-specific category
- Sort options: Newest (default), Oldest, Quick Reads (by read time)
- Combined filtering: Search + category + sort work together

### Featured Posts Logic
- Featured posts defined by `featured: true` in blog data
- Only show featured section when "All" category selected
- Limited to first 3 featured posts

## Responsive Behavior Notes

### Mobile (Under 640px)
- Hero stats show 2 columns
- Search and filters stack vertically
- Blog grid shows single column
- Newsletter form elements stack

### Tablet (640px - 1024px)
- Hero stats may show 3-4 columns
- Blog grid shows 2 columns
- Featured section shows 2 columns

### Desktop (1024px+)
- Full 4-column hero stats
- 3-column blog grids
- Featured cards can span 2 columns
- All filters show horizontally

## Performance Notes
- Blog post images use lazy loading
- Avatar images have error fallbacks
- Featured posts filtered on render
- Search/filter state managed with useMemo for performance
- Date formatting uses browser's built-in Intl API

## Content Notes
- Blog data comes from centralized blogData.ts file
- Categories mapped to industry types
- Author images have SVG fallbacks for missing images
- Publish dates formatted in long format (Month Day, Year)
- Read time calculated and displayed in minutes