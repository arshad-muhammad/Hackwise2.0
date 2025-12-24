import React from "react";

function flowcard() {
  return (
    <>
      <div className="relative w-[420px] h-[500px]">
        {/* Stroke Layer */}
        <div
          className="absolute inset-0 bg-white/15"
          style={{
            clipPath: `polygon(
        20px 0%,
        100% 0%,
        100% calc(100% - 20px),
        calc(100% - 20px) 100%,
        0% 100%,
        0% 20px
      )`,
          }}
        />

        {/* Main Card */}
        <div
          className="absolute inset-[1px] bg-[#0A090F]"
          style={{
            clipPath: `polygon(
        20px 0%,
        100% 0%,
        100% calc(100% - 20px),
        calc(100% - 20px) 100%,
        0% 100%,
        0% 20px
      )`,
          }}
        />
      </div>
    </>
  );
}

export default flowcard;
