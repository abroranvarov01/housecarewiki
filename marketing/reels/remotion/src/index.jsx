import {Composition, Still, registerRoot} from 'remotion';
import {Cover, REEL_FRAMES, Reel} from './Reel';
import timeline from './timeline.json';

const Root = () => (
  <>
    <Composition id="CoffeeCouch" component={Reel} durationInFrames={REEL_FRAMES} fps={timeline.fps} width={1080} height={1920} />
    <Still id="Cover" component={Cover} width={1080} height={1920} />
  </>
);

registerRoot(Root);
