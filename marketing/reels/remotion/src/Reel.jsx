import {AbsoluteFill, Html5Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {TransitionSeries, springTiming} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';
import {BlotArt, SofaSpill, SpotTestArt, TagArt} from './Art';
import {StackedLogo} from './Brand';
import {C, mono, sans, serif} from './theme';
import timeline from './timeline.json';
import {Body, Card, Headline, Kicker, Paper, Pop, Rise, SAFE, TopBar} from './ui';
import {Captions, Voice, wordFrame} from './vo';

const S = timeline.scenes;
const timing = springTiming({config: {damping: 200}, durationInFrames: timeline.transition});

export const REEL_FRAMES = Object.values(S).reduce((a, b) => a + b, 0) - (Object.keys(S).length - 1) * timeline.transition;

const Hook = () => {
  const frame = useCurrentFrame();
  const push = interpolate(frame, [0, S.hook], [1, 1.06]);
  return (
    <Paper>
      <div style={{position: 'absolute', top: 250, left: SAFE.x, right: SAFE.x}}>
        <Headline
          size={158}
          delay={-16}
          lineHeight={0.98}
          lines={[[{t: 'Coffee'}, {t: 'on'}], [{t: 'the'}, {t: 'couch?', italic: true, color: C.terraDeep}]]}
        />
      </div>
      <div style={{position: 'absolute', top: 640, left: SAFE.x}}>
        <Pop delay={wordFrame('hook', 'Don’t') - 3} rotate={-3} from={0.3}>
          <div
            style={{
              padding: '18px 34px',
              borderRadius: 22,
              backgroundColor: C.ink,
              color: C.cream,
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 62,
              letterSpacing: '-0.01em',
              boxShadow: '0 20px 40px -20px rgba(41,50,44,0.6)',
            }}
          >
            Don’t scrub it <span style={{color: C.brandHoney}}>yet.</span>
          </div>
        </Pop>
      </div>
      <div style={{position: 'absolute', top: 760, left: 0, transform: `scale(${push})`, transformOrigin: '540px 400px'}}>
        <SofaSpill />
      </div>
      <Voice lineKey="hook" />
    </Paper>
  );
};

const STEPS = ['Blot, don’t rub', 'Check the care tag', 'Spot-test any cleaner'];

const Title = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const three = spring({frame: frame - 2, fps, config: {damping: 12, mass: 0.8}});
  return (
    <Paper color={C.paperWarm}>
      <div style={{position: 'absolute', top: 300, left: SAFE.x, right: SAFE.x}}>
        <Kicker delay={2}>BEFORE YOU CLEAN IT</Kicker>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 30, marginTop: 30}}>
          <div
            style={{
              fontFamily: serif,
              fontWeight: 700,
              fontSize: 420,
              lineHeight: 0.8,
              color: C.terraDeep,
              transform: `scale(${0.4 + 0.6 * three}) rotate(${(1 - three) * -12}deg)`,
              transformOrigin: 'left bottom',
              opacity: Math.min(1, three * 2),
            }}
          >
            3
          </div>
          <div style={{paddingBottom: 18}}>
            <Headline size={104} delay={6} lineHeight={1.0} lines={[[{t: 'things'}, {t: 'to'}], [{t: 'do'}, {t: 'first', mark: true}]]} />
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', top: 820, left: SAFE.x, right: SAFE.x, display: 'flex', flexDirection: 'column', gap: 22}}>
        {STEPS.map((s, i) => (
          <Rise key={s} delay={16 + i * 6} distance={50}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 28,
                padding: '30px 34px',
                borderRadius: 32,
                backgroundColor: C.card,
                border: `2px solid ${C.rule}`,
                boxShadow: '0 16px 30px -22px rgba(41,50,44,0.45)',
              }}
            >
              <div style={{fontFamily: mono, fontWeight: 500, fontSize: 34, color: C.terraDeep, letterSpacing: '0.05em'}}>0{i + 1}</div>
              <div style={{fontFamily: sans, fontWeight: 600, fontSize: 52, color: C.ink, letterSpacing: '-0.01em'}}>{s}</div>
            </div>
          </Rise>
        ))}
      </div>
      <div style={{position: 'absolute', top: 1450, left: SAFE.x, right: SAFE.x}}>
        <Body delay={34} size={38} color={C.muted}>
          Do them in this order.
        </Body>
      </div>
      <Voice lineKey="title" />
    </Paper>
  );
};

const Tip = ({step, lineKey, headline, children}) => (
  <Paper>
    <TopBar step={step} />
    <div style={{position: 'absolute', top: 310, left: SAFE.x, right: SAFE.x}}>
      <Kicker delay={2}>{`TIP 0${step} / 03`}</Kicker>
      <div style={{marginTop: 26}}>
        <Headline size={118} delay={5} lines={headline} />
      </div>
    </div>
    <Card top={700} height={650} delay={8}>
      {children}
    </Card>
    <div style={{position: 'absolute', top: 1392, left: SAFE.x, right: SAFE.x + 20}}>
      <Captions lineKey={lineKey} />
    </div>
    <Voice lineKey={lineKey} />
  </Paper>
);

const Cta = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const url = spring({frame: frame - wordFrame('cta', 'HouseCareWiki.com') + 8, fps, config: {damping: 200}});
  const urlMark = interpolate(frame - wordFrame('cta', 'HouseCareWiki.com'), [0, 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Paper color={C.forest}>
      <div style={{position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <StackedLogo tone="paper" animateFrom={4} />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1010,
          left: SAFE.x,
          right: SAFE.x,
          padding: '40px 44px',
          borderRadius: 40,
          backgroundColor: C.cream,
          opacity: url,
          transform: `translateY(${(1 - url) * 60}px)`,
        }}
      >
        <div style={{fontFamily: sans, fontWeight: 500, fontSize: 38, color: C.ink2}}>The full 5-step guide is on</div>
        <div
          style={{
            display: 'inline-block',
            marginTop: 10,
            fontFamily: serif,
            fontWeight: 700,
            fontSize: 84,
            letterSpacing: '-0.025em',
            color: C.forest,
            backgroundImage: `linear-gradient(${C.honey}, ${C.honey})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '0 84%',
            backgroundSize: `${urlMark * 100}% 30%`,
          }}
        >
          housecarewiki.com
        </div>
      </div>
      <div style={{position: 'absolute', top: 1318, left: SAFE.x, right: SAFE.x, display: 'flex', alignItems: 'center', gap: 20}}>
        <Rise delay={wordFrame('cta', 'Save') - 3} distance={24} style={{display: 'flex', alignItems: 'center', gap: 20}}>
          <svg width="40" height="50" viewBox="0 0 40 50">
            <path d="M4 4h32v42L20 34 4 46z" fill="none" stroke={C.brandHoney} strokeWidth="5" strokeLinejoin="round" />
          </svg>
          <div style={{fontFamily: sans, fontWeight: 600, fontSize: 50, color: C.cream}}>Save this for the next spill.</div>
        </Rise>
      </div>
      <div style={{position: 'absolute', top: 1438, left: SAFE.x, right: SAFE.x}}>
        <Body delay={wordFrame('cta', 'Save') + 8} size={28} color="rgba(248,244,235,0.72)">
          General guidance, not a product test. Always follow your sofa maker’s care instructions.
        </Body>
      </div>
      <Voice lineKey="cta" />
    </Paper>
  );
};

export const Reel = () => (
  <AbsoluteFill style={{backgroundColor: C.paper}}>
    <Html5Audio src={staticFile('music.wav')} />
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={S.hook}>
        <Hook />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({direction: 'from-bottom'})} timing={timing} />
      <TransitionSeries.Sequence durationInFrames={S.title}>
        <Title />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({direction: 'from-right'})} timing={timing} />
      <TransitionSeries.Sequence durationInFrames={S.tip1}>
        <Tip
          step={1}
          lineKey="tip1"
          headline={[[{t: 'Blot,'}, {t: 'don’t'}, {t: 'rub.', mark: true}]]}
        >
          <BlotArt />
        </Tip>
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({direction: 'from-right'})} timing={timing} />
      <TransitionSeries.Sequence durationInFrames={S.tip2}>
        <Tip
          step={2}
          lineKey="tip2"
          headline={[[{t: 'Check'}, {t: 'the'}], [{t: 'care'}, {t: 'tag.', mark: true}]]}
        >
          <TagArt />
        </Tip>
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({direction: 'from-right'})} timing={timing} />
      <TransitionSeries.Sequence durationInFrames={S.tip3}>
        <Tip
          step={3}
          lineKey="tip3"
          headline={[[{t: 'Spot-test', mark: true}, {t: 'any'}], [{t: 'cleaner.'}]]}
        >
          <SpotTestArt />
        </Tip>
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe({direction: 'from-bottom'})} timing={timing} />
      <TransitionSeries.Sequence durationInFrames={S.cta}>
        <Cta />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);

// Cover: the full title, sized so it also reads in the 3:4 profile-grid crop (y 240–1680).
export const Cover = () => (
  <Paper>
    <div style={{position: 'absolute', top: 300, left: SAFE.x, right: SAFE.x}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, fontFamily: mono, fontWeight: 500, fontSize: 30, letterSpacing: '0.2em', color: C.terraDeep}}>
        <div style={{width: 56, height: 4, borderRadius: 2, backgroundColor: C.terra}} />
        COFFEE ON THE COUCH?
      </div>
      <div style={{marginTop: 30, fontFamily: serif, fontWeight: 600, fontSize: 104, lineHeight: 1.0, letterSpacing: '-0.028em', color: C.ink}}>
        <span style={{color: C.terraDeep, fontWeight: 700}}>3 things</span> to do
        <br />
        <span
          style={{
            backgroundImage: `linear-gradient(${C.honey}, ${C.honey})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '0 84%',
            backgroundSize: '100% 32%',
          }}
        >
          before
        </span>{' '}
        cleaning
        <br />
        coffee off your couch
      </div>
    </div>
    <div style={{position: 'absolute', top: 740, left: 0, transform: 'scale(0.84)', transformOrigin: '540px 0'}}>
      <SofaSpill id="cover" still />
    </div>
    <div style={{position: 'absolute', top: 1350, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <StackedLogo tone="ink" scale={0.42} tagline={false} />
    </div>
  </Paper>
);
