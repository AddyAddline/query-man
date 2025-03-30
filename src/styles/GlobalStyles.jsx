import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${({ theme }) => theme.background};
    ${({ theme }) =>
      !theme.isDarkMode &&
      `
      background-image: linear-gradient(
        ${theme.surfaceAlt}40 1px, 
        transparent 1px
      ),
      linear-gradient(
        90deg, 
        ${theme.surfaceAlt}40 1px, 
        transparent 1px
      );
      background-size: 20px 20px;
    `}
    color: ${({ theme }) => theme.text.primary};
    transition: background-color 0.3s ease, color 0.3s ease;
    height: 100%;
    overflow: hidden;
  }
  
  html, #root {
    height: 100%;
    overflow: hidden;
  }
  
  a {
    color: ${({ theme }) => theme.primary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  button {
    font-family: inherit;
  }
  
  /* Tab styling */
  .active-tab {
    font-weight: 600;
    position: relative;
  }
  
  /* Full size containers */
  [role="tabpanel"] {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.background};
  }
  
  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.border};
    border-radius: 4px;
    
    &:hover {
      background: ${({ theme }) => theme.text.disabled};
    }
  }
  
  /* Code editor styling */
  .monaco-editor {
    .margin, .monaco-editor-background {
      background-color: ${({ theme }) => theme.surface} !important;
    }
  }
  
  /* Utility classes */
  .visually-hidden {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
  }
`;

export default GlobalStyles;
