"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { motion } from "framer-motion";

export default function DecryptedText({
  text,
  speed = 60,
  maxIterations = 8,
  sequential = true,
  revealDirection = "start",
  useOriginalCharsOnly = false,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+",
  className = "",
  parentClassName = "",
  encryptedClassName = "",
  animateOn = "hover",
  ...props
}) {
  const availableChars = useMemo(() => {
    return useOriginalCharsOnly
      ? Array.from(new Set(text.split(""))).filter((char) => char !== " ")
      : characters.split("");
  }, [useOriginalCharsOnly, text, characters]);

  const shuffleText = useCallback(
    (originalText, currentRevealed) => {
      if (useOriginalCharsOnly) {
        const positions = originalText.split("").map((char, i) => ({
          char,
          isSpace: char === " ",
          index: i,
          isRevealed: currentRevealed.has(i),
        }));

        const nonSpaceChars = positions
          .filter((p) => !p.isSpace && !p.isRevealed)
          .map((p) => p.char);

        for (let i = nonSpaceChars.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [nonSpaceChars[i], nonSpaceChars[j]] = [
            nonSpaceChars[j],
            nonSpaceChars[i],
          ];
        }

        let charIndex = 0;
        return positions
          .map((p) => {
            if (p.isSpace) return " ";
            if (p.isRevealed) return originalText[p.index];
            return nonSpaceChars[charIndex++];
          })
          .join("");
      } else {
        return originalText
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (currentRevealed.has(i)) return originalText[i];
            return availableChars[
              Math.floor(Math.random() * availableChars.length)
            ];
          })
          .join("");
      }
    },
    [useOriginalCharsOnly, availableChars]
  );

  const [displayText, setDisplayText] = useState(text); // Start with actual text
  const [isHovering, setIsHovering] = useState(false);
  const [isScrambling, setIsScrambling] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState(new Set());
  const [hasAnimated, setHasAnimated] = useState(false);
  const [scramblePhase, setScramblePhase] = useState(false); // Track if we're scrambling or decrypting
  const containerRef = useRef(null);

  // Re-initialize when text changes
  useEffect(() => {
    if (!isHovering) {
      setDisplayText(text);
      setRevealedIndices(new Set());
      setScramblePhase(false);
    }
  }, [text, isHovering]);

  useEffect(() => {
    let interval;
    let scrambleInterval;
    let currentIteration = 0;

    const getNextIndex = (revealedSet) => {
      const textLength = text.length;
      switch (revealDirection) {
        case "start":
          return revealedSet.size;
        case "end":
          return textLength - 1 - revealedSet.size;
        case "center": {
          const middle = Math.floor(textLength / 2);
          const offset = Math.floor(revealedSet.size / 2);
          const nextIndex =
            revealedSet.size % 2 === 0 ? middle + offset : middle - offset - 1;

          if (
            nextIndex >= 0 &&
            nextIndex < textLength &&
            !revealedSet.has(nextIndex)
          ) {
            return nextIndex;
          }
          for (let i = 0; i < textLength; i++) {
            if (!revealedSet.has(i)) return i;
          }
          return 0;
        }
        default:
          return revealedSet.size;
      }
    };

    if (isHovering) {
      setIsScrambling(true);
      setScramblePhase(true);
      setRevealedIndices(new Set());

      // Animate scrambling phase quickly
      let scrambleIteration = 0;
      scrambleInterval = setInterval(() => {
        setDisplayText(shuffleText(text, new Set()));
        scrambleIteration++;
        if (scrambleIteration >= 3) {
          clearInterval(scrambleInterval);
          // Immediately start decrypting
          currentIteration = 0;
          interval = setInterval(() => {
            setRevealedIndices((prevRevealed) => {
              if (sequential) {
                if (prevRevealed.size < text.length) {
                  const nextIndex = getNextIndex(prevRevealed);
                  const newRevealed = new Set(prevRevealed);
                  newRevealed.add(nextIndex);
                  setDisplayText(shuffleText(text, newRevealed));
                  return newRevealed;
                } else {
                  clearInterval(interval);
                  setIsScrambling(false);
                  setDisplayText(text);
                  setScramblePhase(false);
                  return prevRevealed;
                }
              } else {
                setDisplayText(shuffleText(text, prevRevealed));
                currentIteration++;
                if (currentIteration >= maxIterations) {
                  clearInterval(interval);
                  setIsScrambling(false);
                  setDisplayText(text);
                  setRevealedIndices(
                    new Set(Array.from({ length: text.length }, (_, i) => i))
                  );
                  setScramblePhase(false);
                }
                return prevRevealed;
              }
            });
          }, speed);
        }
      }, speed / 2); // Faster scrambling
    } else {
      // On hover out: scramble then decrypt back to normal
      setIsScrambling(true);
      setScramblePhase(true);
      setRevealedIndices(new Set());

      // Animate scrambling phase quickly
      let scrambleIteration = 0;
      scrambleInterval = setInterval(() => {
        setDisplayText(shuffleText(text, new Set()));
        scrambleIteration++;
        if (scrambleIteration >= 3) {
          clearInterval(scrambleInterval);
          // Immediately start decrypting back to normal
          currentIteration = 0;
          interval = setInterval(() => {
            setRevealedIndices((prevRevealed) => {
              if (sequential) {
                if (prevRevealed.size < text.length) {
                  const nextIndex = getNextIndex(prevRevealed);
                  const newRevealed = new Set(prevRevealed);
                  newRevealed.add(nextIndex);
                  setDisplayText(shuffleText(text, newRevealed));
                  return newRevealed;
                } else {
                  clearInterval(interval);
                  setIsScrambling(false);
                  setDisplayText(text);
                  setScramblePhase(false);
                  return prevRevealed;
                }
              } else {
                setDisplayText(shuffleText(text, prevRevealed));
                currentIteration++;
                if (currentIteration >= maxIterations) {
                  clearInterval(interval);
                  setIsScrambling(false);
                  setDisplayText(text);
                  setRevealedIndices(
                    new Set(Array.from({ length: text.length }, (_, i) => i))
                  );
                  setScramblePhase(false);
                }
                return prevRevealed;
              }
            });
          }, speed);
        }
      }, speed / 2); // Faster scrambling
    }

    return () => {
      if (interval) clearInterval(interval);
      if (scrambleInterval) clearInterval(scrambleInterval);
    };
  }, [
    isHovering,
    text,
    speed,
    maxIterations,
    sequential,
    revealDirection,
    shuffleText,
  ]);

  useEffect(() => {
    if (animateOn !== "view" && animateOn !== "both") return;

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsHovering(true);
          setHasAnimated(true);
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );
    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [animateOn, hasAnimated]);

  const hoverProps =
    animateOn === "hover" || animateOn === "both"
      ? {
          onMouseEnter: () => setIsHovering(true),
          onMouseLeave: () => setIsHovering(false),
        }
      : {};

  return (
    <motion.span
      ref={containerRef}
      className={`inline-block ${parentClassName}`}
      style={{
        display: "inline-block",
        position: "relative",
        lineHeight: "inherit",
      }}
      {...hoverProps}
      {...props}
    >
      <span className="sr-only">{text}</span>
      {/* Hidden span to maintain exact width - ensures container doesn't resize */}
      <span
        aria-hidden="true"
        style={{
          visibility: "hidden",
          display: "inline-block",
          whiteSpace: "pre",
          fontFamily: "inherit",
          fontSize: "inherit",
          fontWeight: "inherit",
          letterSpacing: "inherit",
        }}
      >
        {text}
      </span>
      {/* Visible animated text - absolutely positioned to overlay */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          whiteSpace: "pre",
          display: "inline-block",
          fontFamily: "inherit",
          fontSize: "inherit",
          fontWeight: "inherit",
          letterSpacing: "inherit",
        }}
      >
        {displayText.split("").map((char, index) => {
          // Show actual character if it's revealed during decryption
          // During scrambling phase or if not revealed, show scrambled character
          const isRevealed = revealedIndices.has(index) && scramblePhase;
          const isFullyDecrypted =
            !isScrambling && revealedIndices.size === text.length;
          const isNormal =
            !isHovering && !isScrambling && revealedIndices.size === 0; // Show normal text when animation is complete

          return (
            <span
              key={index}
              className={
                isRevealed || isFullyDecrypted || isNormal
                  ? className
                  : encryptedClassName
              }
            >
              {char}
            </span>
          );
        })}
      </span>
    </motion.span>
  );
}
