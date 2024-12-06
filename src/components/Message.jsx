/* eslint-disable react/prop-types */
function Message({ text, sender }) {
  return (
    <div className={`message ${sender === "You" ? "outgoing" : "incoming"}`}>
      <p>{text}</p>
    </div>
  );
}

export default Message;
