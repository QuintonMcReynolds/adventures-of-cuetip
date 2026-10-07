// Adventures of Cuetip, Vol. 1: Soul Searching. The script.
//
// Format, one instruction per line:
//   # label                     jump target
//   who: text                   dialogue (cuetip, bride, vexmoor, bramble, moss, kit, ozzie, warden)
//   plain text                  narration
//   @bg key [cut]   @show who face pos   @face who face   @hide who|all
//   @music key|stop  @amb key|stop  @sfx key  @fx shake|flash|red   @tint memory|red|none  @rain on|off
//   @set hs=40 bonds+1 guard=1  @if expr -> label   @jump label   @wait seconds
//   @battle id                  play a fight from battle.js
//   @learn Name                 announce a new technique     @clue   find one of the three secret clues
//   @alias who Display Name     @chapter Title|Subtitle      @end id
//   * text -> label ; bonds+1   a choice option
"use strict";

const STORY = String.raw`
# start
@set hs=0 bonds=0 clues=0 guard=0 focus=0 dash=0 heavy=0 meds=0 claws=0
@bg black cut
@music lull
@tint memory
@bg startree
@show bride neutral center
Every night, the same dream.
A tree made of starlight. A meadow of white flowers. And her, standing with her back to him, hair so long it pools in the grass like spilled ink.
bride: Cuetip.
cuetip: Who are you? Why do I keep dreaming about you?
bride: Find me. Before the dark does.
cuetip: Wait. Turn around. Please, I just want to see your...
@hide bride
@fx flash
@tint none
@bg black cut
@wait 0.6
@chapter Adventures of Cuetip|Vol. 1: Soul Searching

# village
@bg village
@amb stop
@music home
@show cuetip smile center
Bluehollow. The night of the Lantern Festival.
The whole village is out. Paper lanterns sway over the square, someone is burning sugar-bread again, and Cuetip is perched on the well, kicking his feet, thinking about a girl he has never met.
cuetip: Same dream again. Fifth night in a row.
cuetip: Long hair. A tree made of stars. "Find me before the dark does." Very dramatic. Zero directions.
@face cuetip neutral
He laughs at himself. But his chest aches the way it always does when he wakes up, like something important is somewhere else.
@music unease
@sfx whisper
The lanterns go out. All of them. All at once.
@face cuetip surprised
@show vexmoor smile right
@fx shake
vexmoor: So you're the one she dreams about.
A figure in black robes steps out of the dark, crowned in thorns, his face cracked with veins like rot spreading through old wood.
@alias vexmoor Vexmoor
vexmoor: I am Vexmoor. Some call me the Rot King. I've come a very long way to meet you, little rabbit.
cuetip: I'm not a rabbit. And I don't know you.
vexmoor: No. But you will. You'll think of me every single day for the rest of your short, short life.
@face vexmoor angry
vexmoor: The woman in your dreams is the last light left in this world. Whoever she chooses gets everything. And she's been choosing *you*.
vexmoor: Some blue nothing from a farm village. It's fucking insulting.
@face cuetip angry
cuetip: Get out of my village.
@face vexmoor smile
vexmoor: Make me.
@battle prologue

# curse
@bg village cut
@show cuetip hurt left
@show vexmoor smile right
@fx shake
Cuetip hits the cobblestones hard. Everything he threw at Vexmoor went through him like smoke.
vexmoor: Brave. Pointless, but brave.
Vexmoor kneels and presses one long grey finger against Cuetip's chest.
@sfx glass
@fx red
@set hs=25
vexmoor: A gift. I call it HS.
Something black blooms under Cuetip's fur, right where the finger touched. It's cold. It spreads like ink in water.
vexmoor: It will crawl across your body, piece by piece, and it will never stop. When it reaches your heart, you're mine.
vexmoor: And she'll have nobody left to dream about.
@face cuetip angry
cuetip: I'll find her. And then I'll find *you*.
@face vexmoor dark
vexmoor: I'm counting on it.
@hide vexmoor
@sfx whisper
He's gone. The lanterns flicker back on, one by one, over a village that is very quiet now.
@face cuetip sad
Cuetip looks down at the black mark on his chest. It's already bigger than it was a second ago.
@chapter Chapter One|The Shell on the Mountain

# bramble
@bg mountain
@music home
@hide all
Three days later, Cuetip is on a mountain road with a bag, a stick, and no plan.
The HS has crept down his arm. Some mornings his legs don't want to work. Today is one of those mornings.
@show cuetip hurt left
cuetip: Okay. Okay. Just... a little rest.
He sits down on the stone steps of an old shrine and does not get back up.
@show bramble neutral right
@alias bramble ???
bramble: You're sitting on my steps.
An old tortoise in a faded orange robe peers down at him, eyebrows so big they could have their own weather.
cuetip: Sorry. I'll move. Give me a minute. Or a day.
bramble: Hmm. That black on your arm. Rot magic. I've seen it once before, a long time ago.
@face bramble stern
bramble: The one who had it ran until it caught him. Do you plan to run, little one?
* "I plan to find someone. And then beat the guy who did this." -> br_a ; bonds+1
* "I don't know what I plan. I'm scared." -> br_b ; bonds+1
* "No offence, but who are you?" -> br_c

# br_a
@face bramble smile
bramble: Ha! Two plans. Most people don't even have one.
@jump br_teach

# br_b
@face bramble smile
bramble: Good. Scared is honest. Honest is where all real training starts.
@jump br_teach

# br_c
@face bramble neutral
bramble: Rude. Fair, but rude.
@jump br_teach

# br_teach
@alias bramble Bramble
bramble: I am Bramble. I keep this shrine, I nap, and occasionally I teach the young and foolish how not to die.
bramble: You can't outrun the rot, and you can't outpunch it. But you *can* learn to stop letting everything hit you.
@face cuetip neutral
cuetip: You're going to teach me to fight?
@face bramble stern
bramble: I'm going to teach you to *not get hit*. Fighting is what you do with the time that buys you.
bramble: Raise your guard. When I strike, meet it at the last moment. Not early. Not late. The shell turns the blow aside.
@battle bramble
@set guard=1
@learn Guard & Parry
@face bramble smile
@face cuetip smile
bramble: Not bad. Your timing is terrible, but your stubbornness is excellent.
@face bramble neutral
bramble: Now. You said you're looking for someone. A woman with very long hair, who you've only seen from behind.
@face cuetip surprised
cuetip: How do you know that?
bramble: Because you talk in your sleep, and you slept on my steps for six hours.
bramble: There's an old rhyme on this mountain. A clue, if you like. *Where the moth keeps her lamps, the second step is found.*
@clue
bramble: Go down to the Lantern Swamp. Find Dr. Moss. She's the only one who might slow that rot.
@face bramble sad
bramble: And Cuetip. Watch the forest road. Something has been following you since the village.
@chapter Chapter Two|Teeth in the Dark

# wolves
@bg forest
@music unease
@hide all
@show cuetip neutral center
The forest road. Too quiet. No birds.
Then: red eyes. Two pairs. Low to the ground.
@face cuetip angry
cuetip: Vexmoor's dogs. Of course.
@battle wolves
@face cuetip hurt
The last wolf dissolves into black smoke. Cuetip leans on a tree, breathing hard.
@set hs=45
@face cuetip sad
But the fight cost him. The black has climbed past his shoulder now. His hands won't stop shaking.
cuetip: Lantern Swamp. Just get to the swamp.
@chapter Chapter Three|The Lantern Swamp

# moss
@bg swamp
@music home
@hide all
He makes it to the swamp. Barely. He makes it to a little hut on stilts with lamps in every window.
He does not make it up the ladder.
@show moss surprised right
@alias moss ???
moss: Oh, sweetheart. Oh no. No, no, you stay right there. Don't try to climb.
@show cuetip hurt left
A moth in a healer's shawl flutters down, huge dark eyes behind round gold glasses, and catches him as he falls.
@alias moss Dr. Moss
moss: Dr. Moss. Don't talk. I know exactly what this is.
@bg swamp cut
@face moss sad
Inside, she lays him on a cot and looks at the black spreading across his body for a long time.
moss: HS. Vexmoor's curse. I've treated it before.
cuetip: Can you cure it?
@face moss sad
moss: No. I'm not going to lie to you, Cuetip. There's no cure. Not one that I know of.
@face cuetip sad
moss: But listen to me. *Listen.* No cure doesn't mean no life.
She takes out a small glass vial and a needle, and her voice gets very gentle and very firm.
@face moss neutral
moss: This is your medicine. When the HS flares, you take a shot. It pushes the rot back. It lets you function. Walk. Fight. Live.
@set meds=1
* "So I have to take shots... forever?" -> moss_a
* "Then show me how. I'm not stopping." -> moss_b ; bonds+1
* "Does it hurt?" -> moss_c ; bonds+1

# moss_a
@face moss smile
moss: Maybe. And that's okay. Glasses are forever too, and nobody calls me weak for wearing them.
moss: The shot doesn't make you less, Cuetip. It makes you *you*. It gives you your days back.
@jump moss_train

# moss_b
@face moss smile
moss: There he is. Good.
@jump moss_train

# moss_c
@face moss smile
moss: A pinch. Less than the rot does. You'll get used to it, and then one day you'll forget it was ever a big deal.
@jump moss_train

# moss_train
@face moss neutral
moss: Now. Medicine works best with the second half of the treatment. Focus. Breath. Stillness.
moss: When the rot pushes, you stop, breathe, and heal. Your body knows how. You just have to let it.
@sfx whisper
Something hisses outside. Green lights in the reeds.
@face moss surprised
moss: Rot wisps. They smell the HS. They'll make it flare.
@face cuetip angry
cuetip: Then this is a practical exam.
@battle moss
@set focus=1 hs=35
@learn Focus & Medicine
@face moss smile
@face cuetip smile
moss: Look at you. Flared up, took your shot, kept your head. That's the whole thing, Cuetip. That's all of it.
cuetip: Thank you. Really.
@face moss neutral
moss: Take these. Enough for your journey. And one more thing...
She hands him a scrap of old paper she found pressed in one of her books, years ago. It glows faintly when he touches it.
moss: *Past the ember road, the blade who lost her way holds the third.*
@clue
moss: A blade who lost her way. Be careful, sweetheart. Blades bite.
@chapter Chapter Four|The Ember Road

# kit
@bg ember
@music unease
@hide all
@show cuetip neutral left
The Ember Road runs through red canyons that never quite cool down. The sun hangs low and huge.
@sfx cards
@show kit smile right
@alias kit ???
kit: Bag. Medicine. Any shiny things. On the ground, slowly, and nobody gets cut.
A fox in a dark gi steps out from behind a rock with a sword that has clearly been used.
cuetip: You want my *medicine*?
kit: Medicine sells. Everything sells out here.
@face kit neutral
Her eyes drop to the black on his arm. Something in her face changes.
kit: ...Rot King's mark. Shit.
@face kit angry
kit: Doesn't matter. Bag. Now.
@face cuetip angry
cuetip: No.
@battle kit
@face kit hurt
@face kit surprised
Kit is on her back in the red dust, sword three metres away, staring at the sky.
kit: Okay. Ow. Okay.
@face cuetip neutral
cuetip: You're the one Moss's clue talked about. "The blade who lost her way."
@alias kit Kit
@face kit sad
kit: Kit. Used to be a Rot Knight. Vexmoor's. Walked out when he started cursing kids in villages for fun.
kit: Been robbing travellers since. Turns out I'm a better swordswoman than I am a person.
* "You can be both. Come with me." -> kit_a ; bonds+1
* "You almost took my medicine. That's not nothing." -> kit_b
* "Teach me to fight like that and we're even." -> kit_c ; bonds+1

# kit_a
@face kit surprised
kit: ...You're serious. You just met me. I tried to rob you.
cuetip: Badly.
@face kit smile
kit: Fuck off. Fine. Fine!
@jump kit_train

# kit_b
@face kit sad
kit: Yeah. I know. I'm sorry. For whatever that's worth out here.
@jump kit_train

# kit_c
@face kit smile
kit: Ha. Deal, blue.
@jump kit_train

# kit_train
@face kit neutral
kit: Here's what Vexmoor's knights learn on day one. You see a big lunge coming, you don't wait for it. You go *through* it.
kit: Dash in while they're winding up. Cut the attack off before it exists. Watch for my tell.
@battle kit_train
@set dash=1
@learn Dash Strike
@face kit smile
kit: That's it. That's the move that got me knighted. Don't tell anyone a farm bunny learned it in an afternoon.
@face kit neutral
She pulls a cord from under her gi. On it hangs a black iron key and a slip of paper.
kit: Took this off Vexmoor's desk when I left. Never knew what it opened.
kit: *Where the champion stands, the claws of the fallen star sleep.*
@clue
kit: The champion. That's got to be the Iron Ring. Ozzie's place.
@chapter Chapter Five|The Iron Ring

# ozzie
@bg arena
@music battle
@hide all
@show cuetip neutral left
@show kit neutral right
The Iron Ring: a city built around a fighting pit, all floodlights and noise and the smell of beer and blood.
@sfx slam
@hide kit
@show ozzie smile right
@alias ozzie ???
ozzie: WELL, LOOK WHAT THE CAT DRAGGED IN. KIT, YOU OWE ME MONEY.
A bear the size of a wardrobe, in boxing gloves and a championship belt, pulls Kit into a hug that lifts her off the ground.
@alias ozzie Ozzie
ozzie: And who's this little blueberry?
cuetip: Cuetip. I'm looking for the claws of the fallen star.
@face ozzie surprised
The bear goes quiet. The whole bar goes quiet.
ozzie: The Starfang Claws. Forged from a star that fell on this city a hundred years ago. Only ever worn by a champion.
@face ozzie neutral
ozzie: I've kept them in my vault for thirty years. Waiting for somebody who deserved them.
ozzie: You want 'em, you earn 'em. In the ring.
@face cuetip angry
cuetip: Fine.
@face ozzie smile
ozzie: HA! I like him. But kid, nobody gets through my guard with little pokes. You need to hit like a mountain falling.
ozzie: Plant your feet. Breathe in. Hold it, hold it, *hold it*, then let the whole damn world go through your fist.
@battle ozzie
@set heavy=1
@learn Heavy Blow
@face ozzie surprised
The crowd loses its mind. Ozzie is sitting on the canvas for the first time in thirty years, laughing so hard he can't get up.
@face ozzie smile
ozzie: THAT'S MY CHAMPION! Somebody get the vault!
* "Thanks, Ozzie. I couldn't have done it without you." -> oz_a ; bonds+1
* "Are you okay? I hit you really hard." -> oz_b ; bonds+1
* Just take the claws. -> oz_c

# oz_a
ozzie: Course you couldn't. But you did. That's what matters.
@jump oz_claws

# oz_b
ozzie: Okay? Kid, I haven't felt this alive since the Clinton administration.
@jump oz_claws

# oz_c
@face ozzie neutral
ozzie: All business, huh. Fair. You've got somewhere to be.
@jump oz_claws

# oz_claws
@sfx shard
@fx flash
@set claws=1
@learn Starfang Claws
Silver claws, cold and bright as winter starlight, fitted over his own. They hum when he flexes.
@show moss neutral center
@show bramble neutral left
@hide cuetip
And then, one by one, the others arrive. Bramble, wheezing from the stairs. Dr. Moss, with a bag full of medicine. Kit, pretending she wasn't waiting.
bramble: You didn't think we'd let you go to the Black Spire alone, did you?
moss: Somebody has to make sure you take your doses on time.
@hide moss
@hide bramble
@show cuetip smile left
@show kit smile right
kit: And somebody has to make sure you don't die in the first five minutes.
@face cuetip smile
@if bonds>=3 -> oz_bonds
@jump spire

# oz_bonds
Cuetip looks at all of them, these people who were strangers a week ago, and something in his chest that has nothing to do with HS goes warm and bright.
cuetip: I'm really glad I met you. All of you.
ozzie: STOP IT. I'LL CRY. I'M A CHAMPION.
Dr. Moss quietly slips an extra dose into his bag. *For the last fight*, she whispers.
@jump spire

# spire
@hide all
@bg spire
@music unease
@chapter Chapter Six|The Black Spire
The Black Spire. Vexmoor's tower, black stone and green fire, rising out of a dead forest.
@set hs=55
The HS is worse here. It knows it's close to home. The black has reached Cuetip's neck.
@show cuetip angry left
@show warden angry right
@sfx slam
@fx shake
@alias warden The Gravewarden
warden: NONE. SHALL. PASS.
Armour with no one inside it. Black ooze where a neck should be. A helmet floating above it all, burning red.
kit: The Gravewarden. Vexmoor's first knight. Cuetip, I'll take the flank, you...
cuetip: No. Stay with the others. He's mine.
@battle warden
@hide warden
@fx shake
The Gravewarden comes apart in a clatter of iron and a puddle of black that sinks into the stone.
@face cuetip hurt
Cuetip is panting. Shaking. His medicine is running low.
@face cuetip angry
He goes up the stairs anyway.

# throne
@bg spire cut
@music boss
@show vexmoor smile right
@show cuetip angry left
vexmoor: You came. And look at you. Almost all mine already.
@face vexmoor dark
vexmoor: Do you feel it? The rot in your throat? Every breath a little harder? Give up, Cuetip. Lie down. It doesn't have to hurt anymore.
@face cuetip angry
cuetip: It always hurts. I take my medicine. I get up. I keep going.
cuetip: That's what you never understood. HS doesn't get to decide who I am.
@face vexmoor angry
vexmoor: Then die standing.
@battle final

# victory
@hide all
@show vexmoor hurt right
@fx flash
@fx shake
@sfx break
The Starfang Claws catch the last of the green fire and light up like a falling star.
Vexmoor staggers. His crown of thorns cracks down the middle.
vexmoor: No. No, I made you. Every mark on you is *mine*.
@show cuetip angry left
cuetip: The marks are yours. The rest of me isn't.
@hide vexmoor
@sfx glass
Vexmoor comes apart like ash in the wind. The green fires go out. The black stone of the Spire starts to crack.
@face cuetip surprised
And the HS on Cuetip's body stops spreading.
It doesn't disappear. The marks stay, dark against his blue fur. But for the first time since the festival, they're *still*.
@show moss sad right
moss: It won't spread any further now. You'll still need your shots. Probably always.
@face cuetip smile
cuetip: That's okay. I know how to do that now.
@hide moss
In the rubble of Vexmoor's throne, something glows: a fourth scrap of paper, all three clues joined together into a map.
A map to a tree made of starlight.
@chapter Epilogue|Under the Star Tree

# finale
@hide all
@bg startree
@music lull
@amb stop
The meadow from his dreams is real. White flowers to the edge of the sky. And in the middle, the tree, glowing.
@show bride neutral center
And her.
Standing with her back to him. Hair so long it pools in the grass like spilled ink, stars caught in it.
@show cuetip sad left
cuetip: It's you.
bride: It's you.
cuetip: I have to tell you something. Vexmoor cursed me. It's called HS. It's... it's on me. It's not going away. I take medicine for it. I might have to forever.
cuetip: If that's... if you...
@show bride reach center
She reaches back without turning around and finds his clawed hand with hers.
bride: Cuetip. I've watched you walk across the whole world for me with that curse on your back.
bride: I love every mark on you. They're the map of how you got here.
@face cuetip smile
@music tender
@hide all
@show bride veil center
@show cuetip smile left
@show bramble smile right
They are married under the Star Tree at the end of summer.
Bramble officiates, and falls asleep twice. Ozzie cries so loudly he scares the birds. Kit pretends she isn't crying and fools nobody. Dr. Moss makes sure the groom takes his medicine before the vows.
@hide bramble
@show cuetip smile left
She still never turns around for the guests. Some things are only for him.
cuetip: Hey. Are we going to live happily ever after?
bride: We're going to live. Happily is up to us.
@face cuetip smile
And they do.
Cuetip still takes his shots every week. He still has bad days. He has never once had to face them alone.
@hide all
@bg spire
@music unease
Far away, in the ruins of the Black Spire, a cracked crown of thorns twitches in the dark.
@sfx whisper
@end happily
`;

const ENDINGS = {
  happily: { title: "Happily Ever After", kind: "Vol. 1 Complete", hint: "Find her." },
};
