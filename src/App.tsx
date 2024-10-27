import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useEffect, useState } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";

export default function App() {
  const messages = useQuery(api.messages.list);
  const sendMessage = useMutation(api.messages.send);
  const likeMessage = useMutation(api.messages.like);
  const { user } = useUser();

  const [newMessageText, setNewMessageText] = useState("");

  useEffect(() => {
    // Make sure scrollTo works on button click in Chrome
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 0);
  }, [messages]);

  return (
    <main className="chat">
      <header>
        <h1>Convex Chat</h1>
        <p>
          Connected as <strong>{user?.fullName}</strong>
        </p>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>
      <SignedIn>
        {messages?.map((message) => (
          <article
            key={message._id}
            className={message.author === user?.fullName ? "message-mine" : ""}
          >
            <div>{message.author}</div>

            <p>
              {message.body}
              <button
                onClick={async () => {
                  if (user?.fullName) {
                    await likeMessage({
                      liker: user?.fullName,
                      messageId: message._id,
                    });
                  }
                }}
              >
                🤍
                {message.likes > 0 && <span>{message.likes}</span>}
              </button>
            </p>
          </article>
        ))}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (user?.fullName) {
              await sendMessage({
                body: newMessageText,
                author: user?.fullName,
              });
              setNewMessageText("");
            }
          }}
        >
          <input
            value={newMessageText}
            onChange={async (e) => {
              const text = e.target.value;
              setNewMessageText(text);
            }}
            placeholder="Write a message…"
          />
          <button type="submit" disabled={!newMessageText}>
            Send
          </button>
        </form>
      </SignedIn>
      <SignedOut>
        <h1 className="sign-in">Please sign in</h1>
      </SignedOut>
    </main>
  );
}
