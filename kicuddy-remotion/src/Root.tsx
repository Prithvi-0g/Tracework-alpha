import "./index.css";
import { Composition } from "remotion";
import { KiCuddyComposition } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="KiCuddy"
        component={KiCuddyComposition}
        durationInFrames={300}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
