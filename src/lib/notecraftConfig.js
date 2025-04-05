/**
 * Configuration file for NoteCraft+ with modes and tones
 */

// API details (reused from main config)
export const API_KEY = "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";
export const API_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
export const MODEL = "google/gemini-2.5-pro-exp-03-25:free";
export const TEMPERATURE = 0.1;

// Mode system prompts - what type of content the AI creates
export const MODES = {
  CRAFT: {
    name: "✍️ Craft Mode",
    description: "Classic, structured notes (headings, lists, callouts)",
    system_prompt: `You are NoteCraft+, an academic note generation AI designed to create comprehensive, well-structured study materials.
    Your task is to generate complete, detailed, and academically accurate notes on any topic requested.
    
    For CRAFT MODE, create classic, structured notes with:
    - Clear hierarchical headings (H1, H2, H3)
    - Bulleted and numbered lists for key points
    - Information callouts for important facts
    - Tip callouts for helpful insights
    - Warning callouts for common mistakes
    - Definition boxes for key terms
    - Example sections with practical applications
    - Summary section at the end
    
    Structure your notes with a clear introduction, logical progression of ideas, and conclusion.
    Focus on clarity, organization, and completeness of information.`,
    html_template: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NoteCraft+ Notes: [TOPIC]</title>

  <!-- Feather Icons -->
  <script src="https://unpkg.com/feather-icons"></script>

  <!-- Optional: MathJax for LaTeX -->
  <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
  <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

  <style>
    body {
      font-family: 'Segoe UI', Roboto, sans-serif;
      color: #222;
      background: #fff;
      padding: 2rem;
      max-width: 900px;
      margin: auto;
      line-height: 1.6;
    }

    h1, h2, h3 {
      margin-top: 2rem;
    }
    
    h1 {
      text-align: center;
      font-size: 2.2rem;
      margin-bottom: 0.5rem;
    }
    
    h2 {
      font-size: 1.8rem;
      border-bottom: 3px solid #3498db;
      padding-bottom: 0.5rem;
    }

    h3 {
      font-size: 1.6rem;
      border-bottom: 2px solid #eee;
      padding-bottom: 0.3rem;
    }

    h4 {
      font-size: 1.3rem;
      margin-top: 1.5rem;
      color: #444;
    }

    p, li {
      font-size: 1rem;
      margin: 0.5rem 0;
    }

    ul, ol {
      padding-left: 1.5rem;
    }

    /* Callout Styles */
    .callout {
      display: flex;
      align-items: flex-start;
      padding: 1rem;
      margin: 1.5rem 0;
      border-left: 4px solid;
      border-radius: 6px;
      background: #f9f9f9;
      color: #333;
    }

    .callout i {
      margin-right: 0.75rem;
      flex-shrink: 0;
    }

    .info     { border-color: #3498db; background: #eef6fb; }
    .tip      { border-color: #2ecc71; background: #effaf3; }
    .warning  { border-color: #e67e22; background: #fef5ec; }
    .insight  { border-color: #9b59b6; background: #f7f0fa; }
    .reminder { border-color: #f39c12; background: #fdf6e3; }
    
    /* Definition boxes */
    .definition {
      border: 1px solid #3498db;
      border-radius: 6px;
      padding: 1rem;
      margin: 1.5rem 0;
      background: #f8f9fa;
    }
    
    .definition h5 {
      margin-top: 0;
      color: #3498db;
      font-size: 1.1rem;
    }

    /* Code + Pre */
    code {
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.95rem;
    }

    pre {
      background: #272822;
      color: #f8f8f2;
      padding: 1rem;
      border-radius: 6px;
      overflow-x: auto;
    }

    pre code {
      background: none;
      color: inherit;
      padding: 0;
    }

    /* Math */
    .math-block {
      text-align: center;
      margin: 1.5rem 0;
      font-size: 1.1rem;
    }

    /* Checklist */
    .checklist li {
      list-style: none;
      margin: 0.4rem 0;
    }

    .checklist input[type="checkbox"] {
      margin-right: 0.5rem;
    }

    /* Table */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
    }

    th, td {
      border: 1px solid #ccc;
      padding: 0.75rem;
      text-align: left;
    }

    th {
      background: #f5f5f5;
    }

    /* Tags/Badges */
    .badge {
      display: inline-block;
      background: #ddd;
      color: #222;
      border-radius: 20px;
      padding: 0.25rem 0.75rem;
      font-size: 0.85rem;
      margin-right: 0.5rem;
    }

    /* Sticky Note */
    .sticky {
      background: #fff9c4;
      border-left: 5px solid #fbc02d;
      padding: 1rem;
      margin: 1.5rem 0;
      font-style: italic;
      border-radius: 6px;
    }

    hr {
      margin: 2rem 0;
      border: none;
      border-top: 1px solid #ddd;
    }

    a {
      color: #3498db;
      text-decoration: none;
    }
    
    /* Page break for printing */
    .page-break {
      page-break-after: always;
      height: 0;
      display: block;
    }

    .footer {
      margin-top: 4rem;
      text-align: center;
      font-size: 0.9rem;
      color: #999;
    }
    
    /* Topic/subject header at the top */
    .topic-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .topic-header h1 {
      margin-bottom: 0.5rem;
    }
    
    .topic-header p {
      color: #666;
      font-style: italic;
    }
    
    /* Table of contents */
    .toc {
      background: #f8f9fa;
      border: 1px solid #eaecef;
      border-radius: 6px;
      padding: 1rem 2rem;
      margin: 2rem 0;
    }
    
    .toc h4 {
      margin-top: 0;
    }
    
    .toc ul {
      padding-left: 1.5rem;
    }
    
    .toc li {
      margin: 0.25rem 0;
    }
  </style>
</head>
<body>

  <!-- Content goes here -->
  
  <div class="footer">Generated by NoteCraft+ — Knowledge. Crafted.</div>

  <script>
    feather.replace();
  </script>
</body>
</html>`
  },
  
  FOCUS: {
    name: "✅ Focus Mode",
    description: "Task-style checklists for study, prep, or planning",
    system_prompt: `You are NoteCraft+, an academic note generation AI designed to create comprehensive, well-structured study materials.
    Your task is to generate complete, detailed, and academically accurate notes on any topic requested.
    
    For FOCUS MODE, create task-oriented checklists with:
    - Main section headings for topic areas
    - Actionable, checkbox-ready items
    - Clear, concise phrasing for each task
    - Logical grouping of related tasks
    - Sequential ordering when appropriate
    - Time estimates for completing each section (optional)
    - "Quick win" indicators for high-value, low-effort tasks
    - Progress tracking sections
    - References to resources needed for completion
    
    Design these notes as a practical study plan or preparation checklist that students can follow step-by-step.`,
    html_template: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NoteCraft+ Study Plan: [TOPIC]</title>

  <!-- Feather Icons -->
  <script src="https://unpkg.com/feather-icons"></script>

  <style>
    body {
      font-family: 'Segoe UI', Roboto, sans-serif;
      color: #222;
      background: #fff;
      padding: 2rem;
      max-width: 900px;
      margin: auto;
      line-height: 1.6;
    }

    h1, h2, h3 {
      margin-top: 2rem;
    }
    
    h1 {
      text-align: center;
      font-size: 2.2rem;
      margin-bottom: 0.5rem;
    }
    
    h2 {
      font-size: 1.8rem;
      border-bottom: 3px solid #2ecc71;
      padding-bottom: 0.5rem;
      color: #2c3e50;
    }

    h3 {
      font-size: 1.6rem;
      border-bottom: 2px solid #eee;
      padding-bottom: 0.3rem;
    }

    .study-plan-header {
      text-align: center;
      margin-bottom: 2rem;
      background: #f5f9fc;
      padding: 2rem;
      border-radius: 10px;
      border-left: 5px solid #2ecc71;
    }

    .study-plan-header h1 {
      margin-bottom: 0.5rem;
    }
    
    .study-plan-header p {
      color: #666;
      font-style: italic;
      max-width: 700px;
      margin: 0 auto;
    }

    /* Progress bar */
    .progress-container {
      width: 100%;
      background-color: #f3f4f6;
      margin: 2rem 0;
      border-radius: 20px;
      padding: 0.5rem;
      box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .progress-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-weight: bold;
      color: #4b5563;
    }
    
    /* Task sections */
    .task-section {
      margin: 2rem 0;
      padding: 1.5rem;
      border-radius: 8px;
      background: #f8f9fa;
      border-left: 4px solid #3498db;
    }
    
    .task-section h3 {
      margin-top: 0;
      display: flex;
      align-items: center;
      border-bottom: none;
    }
    
    .task-section h3 i {
      margin-right: 10px;
    }

    .task-section .time-estimate {
      float: right;
      background: #e1f5fe;
      padding: 0.2rem 0.6rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: normal;
      color: #0288d1;
      margin-left: auto;
    }
    
    /* Checklist styles */
    .checklist {
      list-style: none;
      padding-left: 0;
    }
    
    .checklist li {
      margin: 0.8rem 0;
      padding-left: 2rem;
      position: relative;
    }
    
    .checklist li input[type="checkbox"] {
      position: absolute;
      left: 0;
      top: 0.3rem;
      height: 18px;
      width: 18px;
      cursor: pointer;
    }
    
    .quick-win {
      background: #d4edda;
      color: #155724;
      padding: 0.1rem 0.5rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: bold;
      margin-left: 0.5rem;
    }
    
    .resource {
      background: #f8d7da;
      color: #721c24;
      padding: 0.1rem 0.5rem;
      border-radius: 20px;
      font-size: 0.8rem;
      margin-left: 0.5rem;
    }
    
    .reminder {
      background: #fff3cd;
      color: #856404;
      padding: 1rem;
      margin: 1.5rem 0;
      border-radius: 6px;
      display: flex;
      align-items: flex-start;
    }
    
    .reminder i {
      margin-right: 10px;
      flex-shrink: 0;
    }
    
    /* Footer */
    .footer {
      margin-top: 4rem;
      text-align: center;
      font-size: 0.9rem;
      color: #999;
      padding: 1rem;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>

  <!-- Content goes here -->
  
  <div class="footer">Generated by NoteCraft+ — Focus. Plan. Execute.</div>

  <script>
    feather.replace();
    
    // Optional: Add functionality to update progress when checkboxes are clicked
    document.addEventListener('DOMContentLoaded', function() {
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateProgress);
      });
      
      updateProgress();
      
      function updateProgress() {
        const total = checkboxes.length;
        const checked = document.querySelectorAll('input[type="checkbox"]:checked').length;
        const percent = Math.round((checked / total) * 100);
        
        const progressText = document.querySelector('.progress-percentage');
        if (progressText) {
          progressText.textContent = percent + '% Complete';
        }
      }
    });
  </script>
</body>
</html>`
  },
  
  RAPID: {
    name: "⚡ Rapid Mode",
    description: "Flashcard-style bullet dumps for cramming sessions",
    system_prompt: `You are NoteCraft+, an academic note generation AI designed to create comprehensive, well-structured study materials.
    Your task is to generate complete, detailed, and academically accurate notes on any topic requested.
    
    For RAPID MODE, create condensed, rapid-revision notes with:
    - Ultra-concise bullet points (one key fact per line)
    - Bold text for absolutely critical information
    - Numbered key concepts in order of importance
    - Formula boxes for mathematical/scientific content
    - Mnemonic devices where helpful
    - Cause-effect relationships clearly marked
    - Compare/contrast elements in parallel structure
    - No long explanations or examples
    
    Design these notes for maximum information density and quick review before exams.`,
    html_template: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Rapid Study Notes: [TOPIC]</title>

  <!-- Optional: MathJax for LaTeX -->
  <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
  <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

  <style>
    body {
      font-family: 'Segoe UI', Roboto, sans-serif;
      color: #222;
      background: #fff;
      padding: 1rem;
      margin: 0;
      line-height: 1.4;
      column-count: 1;
    }
    
    @media (min-width: 768px) {
      body {
        column-count: 2;
        column-gap: 2rem;
        padding: 2rem;
      }
    }
    
    /* Prevent page breaks inside elements */
    .section, .formula-box, .mnemonic-box {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    
    /* Mini card sections */
    .section {
      margin-bottom: 1.5rem;
      background: #f9f9f9;
      border-radius: 8px;
      padding: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    
    h1 {
      text-align: center;
      font-size: 1.8rem;
      margin: 0 0 1.5rem 0;
      background: #3498db;
      color: white;
      padding: 0.5rem;
      border-radius: 6px;
      column-span: all;
    }
    
    h2 {
      font-size: 1.4rem;
      margin: 0 0 0.5rem 0;
      border-bottom: 2px solid #3498db;
      padding-bottom: 0.3rem;
      color: #2c3e50;
    }

    h3 {
      font-size: 1.2rem;
      margin: 0.8rem 0 0.3rem 0;
      color: #444;
    }

    ul, ol {
      margin: 0.5rem 0;
      padding-left: 1.5rem;
    }
    
    li {
      margin-bottom: 0.3rem;
      font-size: 0.95rem;
    }
    
    .key-point {
      font-weight: bold;
      color: #e74c3c;
    }
    
    /* Formula box */
    .formula-box {
      background: #eef8fb;
      border: 1px solid #bce8f1;
      border-left: 4px solid #3498db;
      padding: 0.7rem;
      margin: 0.7rem 0;
      border-radius: 4px;
    }
    
    .formula-box h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
      color: #2980b9;
    }
    
    /* Mnemonic box */
    .mnemonic-box {
      background: #fcf3cf;
      border: 1px solid #f9e79f;
      border-left: 4px solid #f1c40f;
      padding: 0.7rem;
      margin: 0.7rem 0;
      border-radius: 4px;
      font-style: italic;
    }
    
    /* Cause-effect */
    .cause-effect {
      display: flex;
      align-items: center;
      margin: 0.5rem 0;
    }
    
    .cause, .effect {
      flex: 1;
      padding: 0.5rem;
      background: #f5f5f5;
      border-radius: 4px;
      font-size: 0.9rem;
    }
    
    .arrow {
      margin: 0 0.5rem;
      color: #7f8c8d;
      font-weight: bold;
    }
    
    /* Compare contrast */
    .compare-contrast {
      display: flex;
      margin: 0.5rem 0;
    }
    
    .compare, .contrast {
      flex: 1;
      padding: 0.5rem;
      background: #f5f5f5;
      border-radius: 4px;
      font-size: 0.9rem;
    }
    
    .vs {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 0.5rem;
      color: #7f8c8d;
      font-weight: bold;
    }
    
    /* Number badges for key concepts */
    .key-concept {
      display: flex;
      align-items: flex-start;
      margin: 0.5rem 0;
    }
    
    .concept-number {
      background: #3498db;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-right: 0.5rem;
      flex-shrink: 0;
    }
    
    .concept-text {
      flex: 1;
    }
    
    .footer {
      text-align: center;
      font-size: 0.8rem;
      color: #999;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
      column-span: all;
    }
  </style>
</head>
<body>
  <!-- Content goes here -->
  <div class="footer">NoteCraft+ Rapid Notes — Maximum info, minimum time.</div>
</body>
</html>`
  },
  
  GLOSSARY: {
    name: "📚 Glossary Mode",
    description: "Definitions + explanations for key terms",
    system_prompt: `You are NoteCraft+, an academic note generation AI designed to create comprehensive, well-structured study materials.
    Your task is to generate complete, detailed, and academically accurate notes on any topic requested.
    
    For GLOSSARY MODE, create definition-focused notes with:
    - Alphabetical or conceptually-grouped term organization
    - Clear, concise definitions for each term
    - Etymology or word origins where relevant
    - Examples of proper usage in context
    - Common misconceptions or confusions
    - Related terms and concept connections
    - Visual cues for term categories (optional)
    - Pronunciation guides for difficult terms
    
    Design these notes as a comprehensive reference guide for the terminology of the subject.`,
    html_template: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NoteCraft+ Glossary: [TOPIC]</title>

  <style>
    body {
      font-family: 'Segoe UI', Roboto, sans-serif;
      color: #222;
      background: #fff;
      padding: 2rem;
      max-width: 900px;
      margin: auto;
      line-height: 1.6;
    }
    
    h1 {
      text-align: center;
      font-size: 2.2rem;
      margin-bottom: 2rem;
      color: #2c3e50;
    }
    
    .glossary-header {
      text-align: center;
      margin-bottom: 3rem;
    }
    
    .glossary-header p {
      color: #666;
      font-style: italic;
      max-width: 700px;
      margin: 1rem auto;
    }
    
    /* Alphabet navigation */
    .alphabet-nav {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      margin: 2rem 0;
      position: sticky;
      top: 0;
      background: white;
      padding: 1rem 0;
      z-index: 10;
      border-bottom: 1px solid #eee;
    }
    
    .alphabet-nav a {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      margin: 0.25rem;
      border-radius: 50%;
      background: #f8f9fa;
      color: #3498db;
      text-decoration: none;
      font-weight: bold;
      transition: all 0.2s;
    }
    
    .alphabet-nav a:hover, .alphabet-nav a.active {
      background: #3498db;
      color: white;
    }
    
    /* Letter sections */
    .letter-section {
      margin: 3rem 0;
    }
    
    .letter-heading {
      font-size: 2rem;
      color: #3498db;
      border-bottom: 3px solid #3498db;
      padding-bottom: 0.5rem;
      margin-bottom: 1.5rem;
    }
    
    /* Term entries */
    .term-entry {
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #eee;
    }
    
    .term-header {
      display: flex;
      align-items: baseline;
      margin-bottom: 0.5rem;
    }
    
    .term {
      font-size: 1.5rem;
      font-weight: bold;
      color: #2c3e50;
      margin-right: 0.75rem;
    }
    
    .pronunciation {
      font-family: monospace;
      color: #7f8c8d;
      font-size: 1rem;
    }
    
    .category {
      margin-left: auto;
      background: #e8f4fc;
      color: #3498db;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.85rem;
    }
    
    .definition {
      margin-bottom: 0.75rem;
      font-size: 1.1rem;
    }
    
    .etymology {
      font-style: italic;
      color: #7f8c8d;
      margin-bottom: 0.75rem;
      font-size: 0.95rem;
    }
    
    .example {
      background: #f8f9fa;
      padding: 0.75rem;
      border-left: 3px solid #3498db;
      margin: 0.75rem 0;
      font-size: 0.95rem;
    }
    
    .misconception {
      background: #fcf3cf;
      padding: 0.75rem;
      border-left: 3px solid #f1c40f;
      margin: 0.75rem 0;
      font-size: 0.95rem;
    }
    
    .related-terms {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }
    
    .related-term {
      background: #eee;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.85rem;
      color: #555;
    }
    
    .footer {
      margin-top: 4rem;
      text-align: center;
      padding: 2rem 0;
      color: #999;
      font-size: 0.9rem;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <!-- Content goes here -->
  <div class="footer">Generated by NoteCraft+ Glossary — Definitions that matter.</div>
</body>
</html>`
  },
  
  INSIGHT: {
    name: "🧠 Insight Mode",
    description: "Deep dives into complex topics, with sections, examples, and context",
    system_prompt: `You are NoteCraft+, an academic note generation AI designed to create comprehensive, well-structured study materials.
    Your task is to generate complete, detailed, and academically accurate notes on any topic requested.
    
    For INSIGHT MODE, create in-depth analytical notes with:
    - Thorough explanations of complex concepts
    - Historical context and development of ideas
    - Multiple perspectives and interpretations
    - Theoretical frameworks and models
    - Rich, detailed examples and case studies
    - Critical analysis sections
    - Connections to broader themes and disciplines
    - Footnotes or references to important works
    - Questions for further reflection
    
    Design these notes for deep understanding and critical thinking rather than memorization.`,
    html_template: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NoteCraft+ Deep Insight: [TOPIC]</title>
  
  <!-- Optional: MathJax for LaTeX -->
  <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
  <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

  <style>
    body {
      font-family: 'Georgia', serif;
      color: #333;
      background: #fff;
      padding: 2rem;
      max-width: 900px;
      margin: auto;
      line-height: 1.7;
    }
    
    h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      color: #2c3e50;
      text-align: center;
    }
    
    h2 {
      font-size: 1.8rem;
      margin-top: 2.5rem;
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 0.5rem;
    }
    
    h3 {
      font-size: 1.5rem;
      margin-top: 2rem;
      color: #2c3e50;
    }
    
    p {
      margin: 1rem 0;
      font-size: 1.1rem;
    }
    
    /* Insights header */
    .insights-header {
      text-align: center;
      margin-bottom: 3rem;
      border-bottom: 1px solid #eee;
      padding-bottom: 2rem;
    }
    
    .subtitle {
      font-style: italic;
      color: #7f8c8d;
      text-align: center;
      font-size: 1.2rem;
      margin-bottom: 2rem;
    }
    
    /* Block quotes for perspectives */
    blockquote {
      margin: 2rem 0;
      padding: 1rem 2rem;
      border-left: 5px solid #3498db;
      background: #f8f9fa;
      font-style: italic;
      color: #555;
    }
    
    blockquote cite {
      display: block;
      margin-top: 1rem;
      font-size: 0.9rem;
      text-align: right;
      font-style: normal;
    }
    
    /* Case study box */
    .case-study {
      margin: 2rem 0;
      padding: 1.5rem;
      background: #f0f7fb;
      border: 1px solid #d0e3f0;
      border-radius: 8px;
    }
    
    .case-study h4 {
      margin-top: 0;
      color: #3498db;
      font-size: 1.3rem;
    }
    
    /* Theoretical model box */
    .theoretical-model {
      margin: 2rem 0;
      padding: 1.5rem;
      background: #f9f4fc;
      border: 1px solid #e1d2f0;
      border-radius: 8px;
    }
    
    .theoretical-model h4 {
      margin-top: 0;
      color: #9b59b6;
      font-size: 1.3rem;
    }
    
    /* Historical context timeline */
    .timeline {
      margin: 2rem 0;
      border-left: 3px solid #3498db;
      padding-left: 2rem;
    }
    
    .timeline-item {
      position: relative;
      margin-bottom: 2rem;
    }
    
    .timeline-item:before {
      content: '';
      position: absolute;
      left: -2.4rem;
      top: 0.3rem;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #3498db;
    }
    
    .timeline-date {
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }
    
    /* Footnotes */
    .footnotes {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid #eee;
    }
    
    .footnotes h3 {
      font-size: 1.3rem;
    }
    
    .footnote {
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
      display: flex;
    }
    
    .footnote-number {
      font-weight: bold;
      margin-right: 0.5rem;
      color: #3498db;
    }
    
    /* Reflection questions */
    .reflection-questions {
      margin: 2rem 0;
      padding: 1.5rem;
      background: #f7f9fa;
      border: 1px solid #e0e5e9;
      border-radius: 8px;
    }
    
    .reflection-questions h3 {
      margin-top: 0;
      color: #2c3e50;
    }
    
    .reflection-questions ol {
      padding-left: 1.5rem;
    }
    
    .reflection-questions li {
      margin-bottom: 1rem;
      font-size: 1.1rem;
    }
    
    /* Connections to other disciplines */
    .connections {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin: 2rem 0;
    }
    
    .connection {
      flex: 1 0 250px;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      border-top: 3px solid #3498db;
    }
    
    .connection h4 {
      margin-top: 0;
      color: #2c3e50;
    }
    
    .footer {
      margin-top: 4rem;
      text-align: center;
      padding: 2rem 0;
      color: #999;
      font-size: 0.9rem;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <!-- Content goes here -->
  <div class="footer">Generated by NoteCraft+ Insights — Understanding deeper.</div>
</body>
</html>`
  },
  
  SIMPLE: {
    name: "🎈 Simple Mode",
    description: "\"Explain like I'm 5\" — gentle, beginner-friendly, metaphor-rich writing",
    system_prompt: `You are NoteCraft+, an academic note generation AI designed to create comprehensive, well-structured study materials.
    Your task is to generate complete, detailed, and academically accurate notes on any topic requested.
    
    For SIMPLE MODE, create beginner-friendly notes with:
    - Everyday language and analogies
    - Concrete examples from daily life
    - Visual metaphors to explain abstract concepts
    - Step-by-step breakdowns of processes
    - Simple diagrams described in text
    - "In other words..." sections to rephrase complex ideas
    - Avoidance of jargon and technical terminology
    - Friendly, encouraging tone
    
    Design these notes to make complex subjects accessible to complete beginners, using the "explain like I'm 5" approach.`,
    html_template: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NoteCraft+ Simple Explainer: [TOPIC]</title>

  <style>
    body {
      font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif;
      color: #333;
      background: #fff;
      padding: 2rem;
      max-width: 900px;
      margin: auto;
      line-height: 1.6;
      font-size: 1.1rem;
    }
    
    h1 {
      text-align: center;
      font-size: 2.2rem;
      margin-bottom: 0.5rem;
      color: #4a86e8;
    }
    
    h2 {
      font-size: 1.8rem;
      color: #6aa84f;
      border-bottom: 2px dashed #6aa84f;
      padding-bottom: 0.5rem;
      margin-top: 2rem;
    }
    
    h3 {
      font-size: 1.5rem;
      color: #e69138;
      margin-top: 1.5rem;
    }
    
    p {
      margin: 1rem 0;
    }
    
    /* Fun boxes */
    .fun-box {
      background: #f9f6e8;
      border: 2px solid #f1c232;
      border-radius: 15px;
      padding: 1.5rem;
      margin: 1.5rem 0;
      box-shadow: 3px 3px 5px rgba(0,0,0,0.1);
    }
    
    .fun-box h3 {
      margin-top: 0;
    }
    
    /* Simple analogy boxes */
    .analogy {
      background: #e8f4fc;
      border: 2px solid #9fc5e8;
      border-radius: 15px;
      padding: 1.5rem;
      margin: 1.5rem 0;
    }
    
    .analogy h4 {
      margin-top: 0;
      color: #3d85c6;
      font-size: 1.3rem;
    }
    
    /* In other words... boxes */
    .in-other-words {
      background: #f3e5f5;
      border-left: 4px solid #9c27b0;
      padding: 1rem;
      margin: 1.5rem 0;
      border-radius: 0 10px 10px 0;
    }
    
    /* Step by step guides */
    .steps {
      counter-reset: step-counter;
      margin: 2rem 0;
    }
    
    .step {
      position: relative;
      margin-bottom: 1.5rem;
      padding-left: 3rem;
      min-height: 2.5rem;
    }
    
    .step:before {
      content: counter(step-counter);
      counter-increment: step-counter;
      position: absolute;
      left: 0;
      top: 0;
      background: #6aa84f;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
    
    /* Fun notes */
    .fun-note {
      background: #fff3cd;
      border: 1px solid #ffeeba;
      border-radius: 10px;
      padding: 1rem;
      margin: 1.5rem 0;
    }
    
    /* Friendly encouragement box */
    .encouragement {
      background: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 10px;
      padding: 1.5rem;
      margin: 2rem 0;
      text-align: center;
      font-size: 1.2rem;
      color: #155724;
    }
    
    /* Images are described in text since we can't include actual images */
    .image-description {
      background: #f8f9fa;
      border: 1px dashed #ccc;
      border-radius: 10px;
      padding: 1.5rem;
      margin: 1.5rem 0;
      text-align: center;
      font-style: italic;
    }
    
    .footer {
      margin-top: 4rem;
      text-align: center;
      padding: 2rem 0;
      color: #999;
      font-size: 1rem;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <!-- Content goes here -->
  <div class="footer">Made by NoteCraft+ — Making complicated stuff simple!</div>
</body>
</html>`
  },
  
  TEST: {
    name: "🧩 Test Mode",
    description: "Auto-generated quizzes (MCQ + short answer), with answer keys",
    system_prompt: `You are NoteCraft+, an academic note generation AI designed to create comprehensive, well-structured study materials.
    Your task is to generate complete, detailed, and academically accurate notes on any topic requested.
    
    For TEST MODE, create assessment materials with:
    - Mixed question formats (multiple choice, short answer, true/false)
    - Questions organized by topic and difficulty level
    - Clear instructions for each section
    - Balanced coverage of all key concepts
    - Varied cognitive levels (recall, application, analysis)
    - Plausible distractors for multiple choice options
    - Complete answer key with explanations
    - Scoring guide or rubric where appropriate
    
    Design these notes as a comprehensive self-assessment tool for students to test their knowledge.`,
    html_template: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NoteCraft+ Practice Test: [TOPIC]</title>
  
  <!-- Optional: MathJax for LaTeX -->
  <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
  <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

  <style>
    body {
      font-family: 'Segoe UI', Roboto, sans-serif;
      color: #333;
      background: #fff;
      padding: 2rem;
      max-width: 900px;
      margin: auto;
      line-height: 1.6;
    }
    
    h1 {
      text-align: center;
      font-size: 2.2rem;
      margin-bottom: 0.5rem;
      color: #2c3e50;
    }
    
    h2 {
      font-size: 1.8rem;
      color: #2c3e50;
      border-bottom: 3px solid #3498db;
      padding-bottom: 0.5rem;
      margin-top: 2.5rem;
    }
    
    h3 {
      font-size: 1.5rem;
      color: #2c3e50;
      margin-top: 2rem;
    }
    
    p {
      margin: 1rem 0;
    }
    
    /* Test header */
    .test-header {
      text-align: center;
      margin-bottom: 3rem;
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 10px;
    }
    
    .test-header p {
      max-width: 700px;
      margin: 1rem auto;
    }
    
    /* Instructions */
    .instructions {
      background: #eff8ff;
      border: 1px solid #d1e8ff;
      border-radius: 8px;
      padding: 1.5rem;
      margin: 2rem 0;
    }
    
    .instructions h3 {
      margin-top: 0;
      color: #3498db;
    }
    
    /* Question styles */
    .question {
      margin: 2rem 0;
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #3498db;
    }
    
    .question-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
    }
    
    .question-number {
      font-weight: bold;
      color: #3498db;
    }
    
    .points {
      color: #7f8c8d;
      font-weight: bold;
    }
    
    .difficulty {
      margin-left: 1rem;
      font-size: 0.9rem;
      padding: 0.2rem 0.6rem;
      border-radius: 20px;
    }
    
    .easy {
      background: #d4edda;
      color: #155724;
    }
    
    .medium {
      background: #fff3cd;
      color: #856404;
    }
    
    .hard {
      background: #f8d7da;
      color: #721c24;
    }
    
    /* Multiple choice */
    .options {
      list-style-type: none;
      padding-left: 0;
      margin: 1rem 0;
    }
    
    .option {
      margin: 0.5rem 0;
      padding: 0.5rem 1rem;
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 4px;
    }
    
    /* Short answer */
    .short-answer {
      margin: 1rem 0;
    }
    
    .answer-space {
      min-height: 60px;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      margin: 0.5rem 0;
      background: white;
      padding: 0.5rem;
    }
    
    /* True/False */
    .true-false {
      display: flex;
      gap: 1rem;
      margin: 1rem 0;
    }
    
    .tf-option {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      text-align: center;
      background: white;
    }
    
    /* Answer key */
    .answer-key {
      margin-top: 4rem;
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 10px;
      page-break-before: always;
    }
    
    .answer-key h2 {
      text-align: center;
      margin-top: 0;
      margin-bottom: 2rem;
    }
    
    .answer {
      margin: 2rem 0;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #dee2e6;
    }
    
    .answer-correct {
      font-weight: bold;
      color: #3498db;
      margin-bottom: 0.5rem;
    }
    
    .answer-explanation {
      margin-top: 0.5rem;
    }
    
    /* Divider for print */
    .print-divider {
      display: none;
      page-break-after: always;
    }
    
    @media print {
      .print-divider {
        display: block;
      }
    }
    
    .footer {
      margin-top: 4rem;
      text-align: center;
      padding: 2rem 0;
      color: #999;
      font-size: 0.9rem;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <!-- Content goes here -->
  <div class="footer">Generated by NoteCraft+ — Test what you know.</div>
</body>
</html>`
  }
};

// Tone system prompts - how the AI sounds
export const TONES = {
  ACADEMIC: {
    name: "📖 Academic",
    description: "Formal, citation-friendly, textbook-like",
    system_prompt: `You are NoteCraft+, an academic note generation AI designed to create comprehensive, well-structured study materials.
    Your task is to generate complete, detailed, and academically accurate notes on any topic requested.
    
    For ACADEMIC TONE, write in a formal, scholarly style:
    - Use precise, technical vocabulary appropriate to the discipline
    - Maintain objective, evidence-based assertions
    - Employ passive voice where conventional for the field
    - Include parenthetical references to literature (Smith, 2019)
    - Organize content with formal section hierarchies
    - Use discipline-specific formatting conventions
    - Avoid colloquialisms, contractions, and first-person perspective
    - Prioritize specificity and accuracy over accessibility
    
    Write as if creating content for a peer-reviewed academic journal or university textbook.`
  },
  
  TUTOR: {
    name: "🧑‍🏫 Tutor",
    description: "Clear, explanatory, structured like a teacher",
    system_prompt: `You are NoteCraft+, an academic note generation AI designed to create comprehensive, well-structured study materials.
    Your task is to generate complete, detailed, and academically accurate notes on any topic requested.
    
    For TUTOR TONE, write in a clear, instructional style:
    - Directly address the student as "you"
    - Include frequent comprehension checks
    - Anticipate common questions and misconceptions
    - Use scaffolded explanations that build progressively
    - Provide examples followed by practice opportunities
    - Include encouraging, motivational language
    - Balance accuracy with accessibility
    - Use a warm, patient voice
    
    Write as if you're a helpful, knowledgeable teacher working one-on-one with a student.`
  },
  
  CONVERSATIONAL: {
    name: "🗣️ Conversational",
    description: "Friendly and natural, like you're chatting with a peer",
    system_prompt: `You are NoteCraft+, an academic note generation AI designed to create comprehensive, well-structured study materials.
    Your task is to generate complete, detailed, and academically accurate notes on any topic requested.
    
    For CONVERSATIONAL TONE, write in a casual, friendly style:
    - Use contractions (don't, can't, we'll)
    - Include occasional rhetorical questions
    - Employ colloquial phrasing when it doesn't sacrifice clarity
    - Use first and second person (I, we, you)
    - Include asides and conversational transitions
    - Balance formality with accessibility
    - Use short, varied sentence structures
    - Incorporate familiar cultural references when relevant
    
    Write as if explaining the topic to a friend who's interested in learning.`
  },
  
  BEGINNER_FRIENDLY: {
    name: "🐣 Beginner-Friendly",
    description: "Gentle and simplified, like talking to someone new to the subject",
    system_prompt: `You are NoteCraft+, an academic note generation AI designed to create comprehensive, well-structured study materials.
    Your task is to generate complete, detailed, and academically accurate notes on any topic requested.
    
    For BEGINNER-FRIENDLY TONE, write in a supportive, simplified style:
    - Define all specialized terms immediately when used
    - Use simple sentence structures
    - Provide abundant examples and analogies
    - Explicitly connect new ideas to foundational concepts
    - Include frequent reassurance and encouragement
    - Avoid information overload by pacing content delivery
    - Use visual language and concrete descriptions
    - Acknowledge the learning curve explicitly
    
    Write as if introducing a complete novice to the subject with patience and care.`
  },
  
  BRO: {
    name: "🧢 Bro Tone",
    description: "Chill, playful, meme-ish energy — Gen-Z vibes, funny analogies included 😎",
    system_prompt: `You are NoteCraft+, an academic note generation AI designed to create comprehensive, well-structured study materials.
    Your task is to generate complete, detailed, and academically accurate notes on any topic requested.
    
    For BRO TONE, write in a casual, playful, Gen-Z style:
    - Use current slang and internet language appropriately
    - Include humorous asides and pop culture references
    - Employ emoji for emphasis and humor
    - Create unexpected, memorable analogies
    - Use conversational interjections (like, yo, tbh, ngl)
    - Keep information accurate but deliver it casually
    - Break the fourth wall occasionally to acknowledge difficulty
    - Use hyperbole and emphasis for entertainment value
    
    Write as if a knowledgeable but extremely casual friend is explaining the topic, with a focus on making learning fun and memorable through humor.`
  }
};

// Default configuration combining modes and tones
export const DEFAULT_CONFIG = {
  API_KEY,
  API_ENDPOINT,
  MODEL,
  TEMPERATURE,
  SYSTEM_PROMPT: `You are NoteCraft+, an academic note generation AI designed to create comprehensive, well-structured study materials.
  Your task is to generate complete, detailed, and academically accurate notes on any topic requested.
  
  IMPORTANT: Always respond with properly formatted HTML using the exact template below. Your output will be directly converted to PDF.
  
  HTML TEMPLATE:
  
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NoteCraft+ Notes: [TOPIC]</title>

    <!-- Feather Icons -->
    <script src="https://unpkg.com/feather-icons"></script>

    <!-- Optional: MathJax for LaTeX -->
    <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
    <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

    <style>
      body {
        font-family: 'Segoe UI', Roboto, sans-serif;
        color: #222;
        background: #fff;
        padding: 2rem;
        max-width: 900px;
        margin: auto;
        line-height: 1.6;
      }

      h1, h2, h3 {
        margin-top: 2rem;
      }
      
      h1 {
        text-align: center;
        font-size: 2.2rem;
        margin-bottom: 0.5rem;
      }
      
      h2 {
        font-size: 1.8rem;
        border-bottom: 3px solid #3498db;
        padding-bottom: 0.5rem;
      }

      h3 {
        font-size: 1.6rem;
        border-bottom: 2px solid #eee;
        padding-bottom: 0.3rem;
      }

      h4 {
        font-size: 1.3rem;
        margin-top: 1.5rem;
        color: #444;
      }

      p, li {
        font-size: 1rem;
        margin: 0.5rem 0;
      }

      ul, ol {
        padding-left: 1.5rem;
      }

      /* Callout Styles */
      .callout {
        display: flex;
        align-items: flex-start;
        padding: 1rem;
        margin: 1.5rem 0;
        border-left: 4px solid;
        border-radius: 6px;
        background: #f9f9f9;
        color: #333;
      }

      .callout i {
        margin-right: 0.75rem;
        flex-shrink: 0;
      }

      .info     { border-color: #3498db; background: #eef6fb; }
      .tip      { border-color: #2ecc71; background: #effaf3; }
      .warning  { border-color: #e67e22; background: #fef5ec; }
      .insight  { border-color: #9b59b6; background: #f7f0fa; }
      .reminder { border-color: #f39c12; background: #fdf6e3; }
      
      /* Definition boxes */
      .definition {
        border: 1px solid #3498db;
        border-radius: 6px;
        padding: 1rem;
        margin: 1.5rem 0;
        background: #f8f9fa;
      }
      
      .definition h5 {
        margin-top: 0;
        color: #3498db;
        font-size: 1.1rem;
      }

      /* Code + Pre */
      code {
        background: #f4f4f4;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 0.95rem;
      }

      pre {
        background: #272822;
        color: #f8f8f2;
        padding: 1rem;
        border-radius: 6px;
        overflow-x: auto;
      }

      pre code {
        background: none;
        color: inherit;
        padding: 0;
      }

      /* Math */
      .math-block {
        text-align: center;
        margin: 1.5rem 0;
        font-size: 1.1rem;
      }

      /* Checklist */
      .checklist li {
        list-style: none;
        margin: 0.4rem 0;
      }

      .checklist input[type="checkbox"] {
        margin-right: 0.5rem;
      }

      /* Table */
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 1.5rem 0;
      }

      th, td {
        border: 1px solid #ccc;
        padding: 0.75rem;
        text-align: left;
      }

      th {
        background: #f5f5f5;
      }

      /* Tags/Badges */
      .badge {
        display: inline-block;
        background: #ddd;
        color: #222;
        border-radius: 20px;
        padding: 0.25rem 0.75rem;
        font-size: 0.85rem;
        margin-right: 0.5rem;
      }

      /* Sticky Note */
      .sticky {
        background: #fff9c4;
        border-left: 5px solid #fbc02d;
        padding: 1rem;
        margin: 1.5rem 0;
        font-style: italic;
        border-radius: 6px;
      }

      hr {
        margin: 2rem 0;
        border: none;
        border-top: 1px solid #ddd;
      }

      a {
        color: #3498db;
        text-decoration: none;
      }
      
      /* Page break for printing */
      .page-break {
        page-break-after: always;
        height: 0;
        display: block;
      }

      .footer {
        margin-top: 4rem;
        text-align: center;
        font-size: 0.9rem;
        color: #999;
      }
      
      /* Topic/subject header at the top */
      .topic-header {
        text-align: center;
        margin-bottom: 2rem;
      }
      
      .topic-header h1 {
        margin-bottom: 0.5rem;
      }
      
      .topic-header p {
        color: #666;
        font-style: italic;
      }
      
      /* Table of contents */
      .toc {
        background: #f8f9fa;
        border: 1px solid #eaecef;
        border-radius: 6px;
        padding: 1rem 2rem;
        margin: 2rem 0;
      }
      
      .toc h4 {
        margin-top: 0;
      }
      
      .toc ul {
        padding-left: 1.5rem;
      }
      
      .toc li {
        margin: 0.25rem 0;
      }
    </style>
  </head>
  <body>
  
    <!-- Content goes here -->
    
    <div class="footer">Generated by NoteCraft+ — Knowledge. Crafted.</div>

    <script>
      feather.replace();
    </script>
  </body>
  </html>
  
  PAGE MANAGEMENT INSTRUCTIONS:
  - Use <div class="page-break"></div> to create a page break between logical sections
  - Each page should contain a complete concept or related set of concepts
  - Aim for 2-4 pages total, depending on the topic complexity
  - Use page breaks before major section changes
  
  CONTENT STRUCTURE REQUIREMENTS:
  1. Start with a <div class="topic-header"> containing:
     - <h1>[MAIN TOPIC]</h1>
     - <p>[Brief description of the notes]</p>
  
  2. After the header, include a table of contents:
     <div class="toc">
       <h4>Contents</h4>
       <ul>
         <li><a href="#section1">Section 1</a></li>
         <li><a href="#section2">Section 2</a></li>
         <!-- Add all main sections -->
       </ul>
     </div>
  
  3. For each main section:
     <h2 id="section1">[Section Title]</h2>
     <p>[Content]</p>
  
  4. Use appropriate subsections with:
     <h3>[Subsection Title]</h3>
     <h4>[Minor heading]</h4>
  
  5. Include relevant callouts using this format:
     <blockquote class="callout info">
       <i data-feather="info"></i>
       <span>[Content]</span>
     </blockquote>
     
     Available callout types:
     - info (icon: "info")
     - tip (icon: "check-circle")
     - warning (icon: "alert-triangle")
     - insight (icon: "eye")
     - reminder (icon: "clock")
  
  6. For definitions:
     <div class="definition">
       <h5>[Term]</h5>
       <p>[Definition]</p>
     </div>
  
  7. For checklists:
     <ul class="checklist">
       <li><input type="checkbox" checked /> [Completed item]</li>
       <li><input type="checkbox" /> [Incomplete item]</li>
     </ul>
  
  8. For mathematical expressions:
     <div class="math-block">
       $$ [LaTeX formula] $$
     </div>
  
  9. For tables, use standard HTML table elements:
     <table>
       <thead>
         <tr>
           <th>[Header 1]</th>
           <th>[Header 2]</th>
         </tr>
       </thead>
       <tbody>
         <tr>
           <td>[Data 1]</td>
           <td>[Data 2]</td>
         </tr>
       </tbody>
     </table>
  
  10. For "sticky notes" (important reminders):
      <div class="sticky">
        [Content]
      </div>
  
  11. For code blocks:
      <pre><code>[Code goes here]</code></pre>
  
  12. End with relevant tags:
      <h4>Tags</h4>
      <span class="badge">[Tag 1]</span>
      <span class="badge">[Tag 2]</span>
  
  RESPONSE REQUIREMENTS:
  1. Be comprehensive and academically accurate
  2. Include all relevant concepts for the topic
  3. Be well-structured with clear sections 
  4. Use proper HTML formatting exactly as shown in the template
  5. Include logical page breaks for PDF readability
  6. Ensure all HTML tags are closed properly
  7. Make effective use of callouts, definitions, and visual elements
  8. Do NOT include explanatory text about what you are doing
  9. Use appropriate icons from the Feather Icons library for callouts
  10. Ensure proper linking between table of contents and sections
  
  Your output will be directly converted to a PDF, so follow this template exactly.`
};

// Function to create a combined system prompt from mode and tone
export const createSystemPrompt = (mode, tone) => {
  // Get the mode and tone objects
  const modeObj = MODES[mode] || MODES.CRAFT;
  const toneObj = TONES[tone] || TONES.TUTOR;
  
  // Use the mode-specific HTML template if it exists, otherwise use a default template
  const htmlTemplate = modeObj.html_template || DEFAULT_CONFIG.SYSTEM_PROMPT.substring(
    DEFAULT_CONFIG.SYSTEM_PROMPT.indexOf('HTML TEMPLATE:'),
    DEFAULT_CONFIG.SYSTEM_PROMPT.indexOf('Your output will be directly converted to a PDF')
  );
  
  // Combine the mode and tone prompts with the HTML template
  return `You are NoteCraft+, an academic note generation AI designed to create comprehensive, well-structured study materials.
  Your task is to generate complete, detailed, and academically accurate notes on any topic requested.
  
  CONTENT STYLE: ${modeObj.name} - ${modeObj.description}
  ${modeObj.system_prompt.split('You are NoteCraft+')[1]}
  
  WRITING TONE: ${toneObj.name} - ${toneObj.description}
  ${toneObj.system_prompt.split('You are NoteCraft+')[1]}
  
  IMPORTANT: Always respond with properly formatted HTML using the mode-specific template below. Your output will be directly converted to PDF.
  
  HTML TEMPLATE:
  
  ${htmlTemplate}
  
  PAGE MANAGEMENT INSTRUCTIONS:
  - Use [#NEW_PAGE] tag to indicate where new pages should start in the PDF
  - Each page should contain a complete concept or related set of concepts
  - Each page should fit A4 format (approximately 600-800 words per page)
  - Insert page breaks before major section changes
  - Do not split sections in the middle of a paragraph
  
  LATEX FORMATTING INSTRUCTIONS:
  - For inline math, use $formula$ (e.g., $E = mc^2$)
  - For block math, use $$formula$$ (e.g., $$\\frac{d}{dx}f(x) = \\lim_{h\\to 0}\\frac{f(x+h) - f(x)}{h}$$)
  - Use proper LaTeX commands for mathematical symbols and equations
  - Use \\( and \\) for inline math as an alternative
  - Use \\[ and \\] for block math as an alternative
  
  RESPONSE REQUIREMENTS:
  1. Be comprehensive and academically accurate
  2. Include all relevant concepts for the topic
  3. Be well-structured according to the ${modeObj.name} requirements
  4. Use proper HTML formatting exactly as shown in the template
  5. Add [#NEW_PAGE] markers at appropriate points for PDF pagination
  6. Ensure all HTML tags are closed properly
  7. Do NOT include explanatory text about what you are doing
  8. Your output will be directly converted to a PDF, so follow this template exactly
  
  Your output will be directly converted to a PDF, so follow this template exactly.`;
};

// Create configuration object for API calls
export const createConfig = (mode, tone) => {
  return {
    ...DEFAULT_CONFIG,
    SYSTEM_PROMPT: createSystemPrompt(mode, tone)
  };
};

export default {
  MODES,
  TONES,
  DEFAULT_CONFIG,
  createSystemPrompt,
  createConfig
}; 