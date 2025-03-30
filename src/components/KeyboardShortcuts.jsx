import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const ShortcutsButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.text.secondary};
  font-size: 14px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  border-radius: 6px;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    color: ${({ theme }) => theme.primary};
    background-color: ${({ theme }) => theme.hover};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease-out;
  backdrop-filter: blur(2px);
`;

const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.background};
  border-radius: 12px;
  width: 550px;
  max-width: 90%;
  max-height: 90vh;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: ${slideUp} 0.3s ease-out;

  @media (max-width: 768px) {
    max-width: 95%;
    width: 100%;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  color: ${({ theme }) => theme.text.primary};
  display: flex;
  align-items: center;
  gap: 10px;

  svg {
    width: 20px;
    height: 20px;
    color: ${({ theme }) => theme.primary};
  }
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: ${({ theme }) => theme.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.text.primary};
    background-color: ${({ theme }) => theme.hover};
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const ShortcutsList = styled.div`
  padding: 16px 20px;
  overflow-y: auto;
  max-height: calc(90vh - 80px);

  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.background};
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.border};
    border-radius: 20px;
    border: 2px solid ${({ theme }) => theme.background};
  }
`;

const ShortcutCategory = styled.div`
  margin-bottom: 24px;
  animation: ${fadeIn} 0.3s ease-out;
  animation-fill-mode: both;
  animation-delay: ${({ index }) => index * 0.05}s;

  &:last-child {
    margin-bottom: 0;
  }
`;

const CategoryTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  color: ${({ theme }) => theme.primary};
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    width: 18px;
    height: 18px;
  }

  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background-color: ${({ theme }) => theme.border};
    margin-left: 10px;
    opacity: 0.6;
  }
`;

const ShortcutItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  transition: all 0.2s ease;
  border-radius: 6px;

  &:hover {
    background-color: ${({ theme }) => theme.hover};
    padding: 8px 10px;
    margin: 0 -10px;
  }
`;

const ShortcutDescription = styled.span`
  color: ${({ theme }) => theme.text.primary};
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.text.secondary};
    opacity: 0.8;
  }
`;

const KeyCombination = styled.div`
  display: flex;
  gap: 5px;
`;

const KeyLabel = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  background-color: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  font-family: "Roboto Mono", monospace;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.text.primary};
  min-width: 20px;
  text-align: center;
  box-shadow: 0 2px 0 ${({ theme }) => theme.border};
  transform: translateY(-1px);
  transition: all 0.1s ease;

  &:hover {
    transform: translateY(0);
    box-shadow: 0 1px 0 ${({ theme }) => theme.border};
  }
`;

const PlusSymbol = styled.span`
  color: ${({ theme }) => theme.text.secondary};
  display: flex;
  align-items: center;
  font-size: 12px;
`;

function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      } else if (e.key === "?" && !isOpen) {
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const shortcuts = [
    {
      category: "Query Execution",
      items: [
        { description: "Run query", keys: ["Ctrl", "Enter"] },
        { description: "Clear editor", keys: ["Ctrl", "L"] },
      ],
    },
    {
      category: "Navigation",
      items: [
        { description: "Next query", keys: ["Alt", "→"] },
        { description: "Previous query", keys: ["Alt", "←"] },
      ],
    },
    {
      category: "Results",
      items: [
        { description: "Export as CSV", keys: ["Ctrl", "S"] },
        { description: "Export as JSON", keys: ["Ctrl", "J"] },
      ],
    },
    {
      category: "User Interface",
      items: [
        { description: "Toggle theme", keys: ["Ctrl", "T"] },
        { description: "Show shortcuts", keys: ["?"] },
      ],
    },
  ];

  return (
    <>
      <ShortcutsButton
        onClick={() => setIsOpen(true)}
        title="Keyboard Shortcuts (?)"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect
            x="2"
            y="4"
            width="20"
            height="16"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M7 9h0M7 13h0M12 9h0M12 13h0M17 9h0M17 13h0"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Shortcuts
      </ShortcutsButton>

      {isOpen && (
        <Modal onClick={() => setIsOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="2"
                    y="4"
                    width="20"
                    height="16"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M6 10h2M6 14h2M11 10h2M11 14h2M16 10h2M16 14h2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Keyboard Shortcuts
              </ModalTitle>
              <CloseButton onClick={() => setIsOpen(false)}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </CloseButton>
            </ModalHeader>

            <ShortcutsList>
              {shortcuts.map((category, index) => (
                <ShortcutCategory key={index} index={index}>
                  <CategoryTitle>{category.category}</CategoryTitle>
                  {category.items.map((shortcut, itemIndex) => (
                    <ShortcutItem key={itemIndex}>
                      <ShortcutDescription>
                        {shortcut.description}
                      </ShortcutDescription>
                      <KeyCombination>
                        {shortcut.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            <KeyLabel>{key}</KeyLabel>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <PlusSymbol>+</PlusSymbol>
                            )}
                          </React.Fragment>
                        ))}
                      </KeyCombination>
                    </ShortcutItem>
                  ))}
                </ShortcutCategory>
              ))}
            </ShortcutsList>
          </ModalContent>
        </Modal>
      )}
    </>
  );
}

export default KeyboardShortcuts;
