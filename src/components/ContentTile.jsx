import React, { useState } from "react";

function ContentTile(props) {
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseOver = () => {
    setIsHovering(true);
  };

  const handleMouseOut = () => {
    setIsHovering(false);
  };

  return (
    <li
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      style={{
        marginRight: 24,
        transition: "transform 0.2s ease",
        transform: isHovering ? "scale(1.03)" : "scale(1)",
        boxShadow: isHovering ? "0 10px 20px rgba(0,0,0,0.35)" : "none",
      }}
    >
      <article>
        <section style={{ zIndex: 2 }}>
          <div>
            <img
              style={{
                height: 140,
                width: 248,
                borderRadius: 8,
              }}
              src={props.poster}
              alt="poster"
            ></img>
          </div>
        </section>
      </article>
    </li>
  );
}

export default ContentTile;
