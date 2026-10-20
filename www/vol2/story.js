// Adventures of Cuetip, Vol. 2: The Blight Moon. The script.
//
// Format, one instruction per line:
//   # label                     jump target
//   who: text                   dialogue (cuetip, bride, vexmoor, bramble, moss, kit, ozzie, nightshade, rook, pip, quill)
//   plain text                  narration
//   @bg key [cut]   @show who face pos   @face who face   @hide who|all
//   @music key|stop  @amb key|stop  @sfx key  @fx shake|flash|red   @tint memory|red|none  @rain on|off
//   @set hs=40 bonds+1 guard=1  @if expr -> label   @jump label   @wait seconds
//   @battle id                  play a fight from battle.js
//   @learn Name                 announce a new technique     @clue   recover one of the three star seeds
//   @alias who Display Name     @chapter Title|Subtitle      @end id
//   * text -> label ; bonds+1   a choice option
"use strict";

const STORY = String.raw`
# start
@set hs=20 bonds=0 clues=0 guard=1 focus=1 dash=1 heavy=1 meds=1 claws=1 braid=0 ward=0 together=0
@bg black cut
@music lull
@tint memory
@bg startree
@show bride neutral center
Previously.
A curse called HS. A Rot King called Vexmoor. A woman with impossibly long hair who never, ever turns around.
Cuetip walked across the whole world to find her, and beat Vexmoor at the top of the Black Spire. The black marks on his body stopped spreading. They didn't go away.
They were married under the Star Tree at the end of summer.
@hide bride
@bg void
@music unease
And in the ruins of the Spire, a cracked crown of thorns twitched in the dark...
@sfx whisper
...and a pale hand picked it up.
@tint none
@bg black cut
@wait 0.6
@chapter Adventures of Cuetip|Vol. 2: The Blight Moon

# home
@bg home
@music home
@show cuetip smile center
One year later.
The cottage under the Star Tree has a crooked chimney, a garden that is mostly weeds, and a front door that Ozzie has broken twice and fixed once.
cuetip: One year. One whole year. Nobody has tried to kill me in a *whole year*.
@face cuetip neutral
Sunday is shot day. It has been for a year.
He sits on the porch step, rolls up his sleeve and finds the spot. A pinch. Done. The marks on his arm stay exactly where they are: dark, quiet, still.
cuetip: There. That one's for getting to chase my wife around the garden.
@show cuetip neutral left
@show bride neutral right
@alias bride Her
bride: You don't chase me. You get lost in the bean rows and call for help.
@face cuetip smile
She stands at the edge of the porch, looking out at the tree, her hair spilling down the steps like ink. Even at home, she never turns around while anyone else might see.
Cuetip stopped asking a long time ago. He doesn't need to see her face to know when she's smiling. Her shoulders do a thing.
bride: Happy anniversary. Hold out your hand.
She reaches back without looking and ties something around his wrist: a thin braid of her own hair, black as ink, with tiny points of starlight caught in it.
@set braid=1
@sfx shard
@face cuetip surprised
cuetip: Is this... your hair?
bride: A little of it. I have plenty.
bride: So wherever you go, a piece of me goes with you.
* "I'm never taking it off." -> h_a ; bonds+1
* "Is this because I keep getting lost in the beans?" -> h_b ; bonds+1
* "I didn't get you anything this good." -> h_c

# h_a
bride: Good. I'd notice.
@jump party

# h_b
bride: Partly.
@jump party

# h_c
bride: You built me a porch. It leans. It's ours. That's plenty.
@jump party

# party
@sfx slam
@fx shake
ozzie: KNOCK KNOCK! PARTY'S HERE!
@hide bride
@show kit smile right
kit: That was Ozzie knocking. The door's fine. Mostly.
kit: He's carrying the cake, so we have maybe two minutes before it's gone.
ozzie: I HEARD THAT.
@hide kit
@show moss smile right
Dr. Moss flutters in behind them with a basket of swamp-honey bread and a look Cuetip knows very well.
moss: Sunday.
cuetip: Took it this morning. Before coffee, even.
@face moss smile
moss: Look at you. A whole year and you've never missed one. I'm so proud of you I could scream.
@hide moss
@show bramble smile right
bramble: Don't scream. I'm napping in the hammock in four minutes.
Bramble, it turns out, has been living in their hammock since spring. Nobody remembers inviting him. Nobody minds.
@hide bramble
@show kit smile right
kit: Okay. Gifts later. First, I want to see if married life made you soft.
@face cuetip smile
cuetip: You want to spar. At my anniversary party.
kit: Loser does the dishes. Ozzie used eleven plates.
@face cuetip angry
cuetip: You're on.
@battle spar
@face kit surprised
Kit lands flat on her back in the flowerbed.
kit: Okay. Ow. Not soft.
@face kit smile
kit: Still terrible at footwork, though. You telegraph everything with your ears.
cuetip: My ears are *expressive*.
@chapter Chapter One|The Wrong Moon

# moonrise
@hide all
@bg blightree
@music unease
@amb stop
The sun goes down, and something else comes up.
A moon. But not the moon. This one is violet and swollen and much too close, and it rises on the wrong side of the sky.
@show cuetip neutral center
@fx red
@set hs=38
@face cuetip hurt
Cuetip's arm jerks. The marks on his body, still for a whole year, *throb*. Then they creep. Just a little.
cuetip: Ah... shit. Shit. It's moving. Moss! It's moving again!
@show moss surprised right
moss: Let me see. Sit down, sweetheart, sit...
@sfx whisper
Something howls in the dark beyond the garden. Then something answers. Then something else.
@face moss sad
moss: Those aren't wolves.
@hide moss
@face cuetip angry
They come over the fence like spilled ink: hounds made of black bramble, purple thorns down their spines, eyes lit the same colour as the moon.
@battle hounds

# nightshade
@show cuetip hurt left
@show nightshade smile right
@alias nightshade ???
nightshade: Oh, don't stop on my account. I love a party.
A tall woman in a gown the colour of a bruise stands on the moonlight like it's a floor. Small purple flowers bloom in her hair, star-shaped and very poisonous.
And on her head is a crown of black thorns, cracked down the middle and mended with silver.
@face cuetip surprised
cuetip: That's Vexmoor's crown.
@face nightshade neutral
nightshade: It's the family's crown. He only borrowed it. Badly.
@alias nightshade Lady Nightshade
nightshade: I'm Nightshade. His big sister. I taught that boy everything he knew about rot, and I see he only listened to half of it.
@face nightshade smile
nightshade: You must be the bunny. Look at you. Still covered in his little marks.
@face cuetip angry
cuetip: What do you want?
nightshade: Let me tell you a secret about my brother's curse. Every mark he ever made, on every body in this world, is a seed.
nightshade: And seeds want a moon.
She lifts one gloved hand toward the violet sky like she's showing off a jewel.
nightshade: Seven nights. When the Blight Moon is full, every mark wakes up, and everyone carrying HS will answer to me. Hundreds of them. Thousands.
@face nightshade dark
nightshade: Including you, sweet thing.
cuetip: Like hell.
@face nightshade smile
nightshade: And just so nobody gets clever...
@hide cuetip
@sfx break
@fx shake
@fx red
She flicks her wrist. A thorn as long as a spear tears through the air and buries itself in the trunk of the Star Tree.
The light in its branches flickers. Leaves go grey. Three small stars rise out of the tree's heart and drift into her open hand like obedient moths.
nightshade: The Star Tree's seeds. A tree without its seeds is just firewood.
@hide nightshade
@sfx whisper
She's gone. The moon is not.

# hold
@show bride neutral center
She walks right past all of them, past Cuetip, to the tree. She lays both hands flat on its bark.
Her hair lifts like it's underwater. Starlight runs up her arms and into the trunk, and the grey stops spreading. Barely.
@show cuetip sad left
cuetip: What are you doing? Get away from that thing, the thorn...
bride: I'm holding it. I'm the last light, remember? That's why the dark always wants this tree. It's my tree.
bride: I can hold it. I can't hold it forever.
@face cuetip angry
cuetip: I'm not leaving you here alone.
bride: I'm not alone. Bramble is staying. Aren't you, Bramble?
@hide cuetip
@show bramble stern right
bramble: Hammock's here. I'm here. Nothing touches her.
@hide bramble
@show cuetip sad left
bride: Bring back the seeds. Stop the moon. Then come home and complain about the garden.
@face cuetip neutral
She can't turn around. She doesn't need to. Her shoulders do the thing.
cuetip: Seven nights.
bride: Six and a half. Go.
@hide all
@show moss neutral left
@show kit neutral right
moss: There's a hexbreaker in the Hollow Peaks. Rook. Miserable old raven. If anyone alive knows how to break a moon, it's him.
moss: And I have patients in Thistledown. Dozens of them carry HS. If their marks are waking up too, they'll be terrified. I need to be there.
kit: Ozzie and I will hit the roads and find out where she's holed up. Meet in Thistledown, three nights.
@face kit smile
kit: Don't die, blue. You still owe me dishes.
@chapter Chapter Two|The Raven of the Hollow Peaks

# rook
@hide all
@bg peaks
@music unease
@show cuetip neutral left
The Hollow Peaks are cold enough to hurt your teeth. Snow falls up as often as it falls down. Ravens circle a crooked tower with one lit window.
@set hs=42
The marks on Cuetip's arm have reached his elbow again. He keeps his medicine bag close and his eyes on the path.
@sfx cards
@show rook stern right
@alias rook ???
rook: No.
cuetip: I didn't say anything yet.
rook: You were going to. I could hear it coming up the mountain. "Please, Mister Raven, break the scary moon." No. Go home.
@alias rook Rook
A raven in a long grey coat stands in the tower door, a gold monocle over one eye and a hex charm glowing in his wing.
@face cuetip angry
cuetip: My wife is holding up a dying tree with her bare hands. I'm not going home.
@face rook neutral
Rook looks at him for a long time. Then at his wrist.
rook: ...What is that?
cuetip: Her hair. She braided it for me. Anniversary present.
@face rook surprised
rook: Starlight from the last light. Wrapped around the wrist of a cursed fool. Huh.
@face rook stern
rook: Fine. Get inside before you freeze. Wipe your feet.
* "Thank you, Rook." -> rk_a ; bonds+1
* "Moss said you were miserable. She undersold it." -> rk_b ; bonds+1
* Wipe your feet. -> rk_c

# rk_a
rook: Don't thank me yet. I haven't helped.
@jump rk_teach

# rk_b
@face rook smile
rook: Ha. She always did.
@jump rk_teach

# rk_c
@face rook smile
rook: Manners. Good. Rarer than courage.
@jump rk_teach

# rk_teach
@face rook neutral
rook: Listen. A curse is a message. Somebody's will, written in rot and thrown at you. Most people can only take the hit.
rook: But that braid remembers where light comes from. Hold it up when a curse comes at you, and the curse will remember where *it* came from.
cuetip: It bounces back?
rook: It goes home. Rot always wants to go home.
@face rook stern
rook: I'm going to throw hexes at you. Green ones. Tap your ward right before they land. Not early. Not late.
cuetip: Bramble taught me parries like that.
rook: Then Bramble did half my job. Wonderful. Begin.
@battle rook
@set ward=1
@learn Ward
@face rook smile
@face cuetip smile
rook: Not awful. You flinch, but you flinch in the right direction.
@face rook neutral
rook: Now. She came through here two nights ago, your Nightshade. One of her moths dropped something on my roof.
He opens his wing. Sitting in his feathers is a small star, pulsing faintly, warm as a candle.
@clue
cuetip: One of the tree's seeds!
rook: She gave the seeds to her servants to carry, so nobody could take all three at once. Clever. Annoying.
@face rook stern
rook: Something you should know, rabbit. My brother had HS. Vexmoor marked whole villages, not just you. There are hundreds of people walking around with that black on their skin.
rook: Most of them live in Thistledown now, where the healer is. Where your Dr. Moss is. If that moon fills, it's not just you.
@face cuetip sad
cuetip: Your brother... is he...
rook: Grumpy, alive, and taking his shots in the lowlands. Go. Thistledown. And Cuetip...
@face rook stern
rook: If she offers you a cure, remember: there's no such thing as a cure that asks you to kneel.
@chapter Chapter Three|Thistledown

# thistle
@hide all
@bg thistle
@music home
@show cuetip neutral center
Thistledown is a village of round huts with purple thistle roofs, lanterns strung between them, and a big white tent in the middle with a red cross on it.
And almost everyone here has the marks.
The baker has them on both hands, dusted with flour. The old man on the bench has them up his neck. Two kids chasing a chicken have them on their arms and do not care at all.
@face cuetip smile
cuetip: Huh.
For a whole year, Cuetip thought he was the only one. He's not sure whether to laugh or cry, so he does a little of both.
@set hs=48
@face cuetip hurt
But tonight, everyone's marks are throbbing under the violet moon, and nobody is laughing.
@show moss sad right
moss: Cuetip! Oh, thank goodness. Everyone's flaring. I've given more shots today than in the last month.
moss: And I have one patient who won't let me near him at all.
@hide moss
@show pip sad right
@alias pip ???
Behind the tent, a little hedgehog in an enormous scarf is sitting on a crate with his arm hidden in his sleeve.
pip: Go away. I'm not having it.
@face cuetip neutral
cuetip: Having what?
pip: The shot. Shots are for sick people. If I take it, then it's real.
@alias pip Pip
pip: I'm Pip. And I'm not sick. I'm just... spotty. Sometimes.
* "It's already real, Pip. The shot just means you get to keep doing stuff." -> pip_a ; bonds+1
* Roll up your sleeve and show him your arm. -> pip_b ; bonds+1
* "You're being a baby about it." -> pip_c

# pip_a
@face pip sad
pip: ...What kind of stuff?
cuetip: Running. Fighting moon witches. Getting married. Losing sparring matches on purpose so Kit feels good about herself.
@face pip smile
pip: You did not get married.
cuetip: I did! She's amazing. You'd like her. She's very tall.
@jump pip_brother

# pip_b
Cuetip rolls his sleeve up past the elbow. Pip's eyes go very wide.
@face pip surprised
pip: You've got the marks. Way more than me.
cuetip: Yep. And I take a shot every Sunday. On my porch. Before coffee.
@face pip neutral
pip: Does it make you less strong?
cuetip: It's the reason I'm strong. I've punched a Rot King with this arm.
@jump pip_brother

# pip_c
@face pip angry
pip: I am NOT a baby! I'm eight and a half!
@face cuetip sad
cuetip: ...Yeah. Sorry. That was a crappy thing to say. I was scared of them too.
@face pip sad
pip: ...You were?
cuetip: Terrified. Dr. Moss had to talk me through the first one.
@jump pip_brother

# pip_brother
@face pip sad
pip: My big brother Quill says I don't need shots. He went to get a real cure. A lady with flowers in her hair told him she had one.
pip: He said he'd come back for me. That was a month ago.
@face cuetip surprised
Something cold slides down Cuetip's back that has nothing to do with HS.
@sfx whisper
@fx shake
And then the lanterns go out, one after another, all down the street.
@face pip surprised
pip: What's that?
@music unease
Green lights in the dark. Wings, too many of them. Moths as big as dogs, wings patterned with glowing eyes, diving at the marked.
@face cuetip angry
cuetip: Stay behind me, Pip. And watch. I'm going to show you something.
@battle thistle

# thistle_after
@music home
@hide all
@show cuetip hurt left
@show pip surprised right
The last moth comes apart into grey dust. Cuetip is on one knee, breathing hard, an empty vial in his hand.
pip: You took your shot. In the middle of a FIGHT.
@face cuetip smile
cuetip: Best time to take it.
@face pip neutral
Pip looks at the vial. Then at his own sleeve. Then he walks very slowly into the white tent.
@show moss neutral center
A minute later he walks back out with his sleeve rolled up and a plaster on his arm, trying very hard not to look proud of himself.
@face pip smile
pip: It was just a pinch.
@face moss smile
Dr. Moss has to take her glasses off and clean them for a while. She says it's the dust.
@hide moss
@face pip neutral
pip: Cuetip? You fought all those moths by yourself. You don't have to do that. That's what you said in there, right? About your friends?
@face cuetip surprised
Behind Pip, the people of Thistledown are coming out of their huts. The baker. The old man. The kids with the chicken. All of them marked. All of them looking at him.
@face cuetip smile
cuetip: Yeah. That's what I said.
@set together=1
@learn Together
@sfx together
When you parry, interrupt, break a guard or send a curse home, the people you love remember you're fighting. When it's full, call them in.
@if bonds>=2 -> thistle_bonds
@jump briar

# thistle_bonds
@face pip smile
pip: When you beat the flower lady, can I come to your house? Can I meet your tall wife?
cuetip: You can come every Sunday. Shot day. We'll do it on the porch together.
@jump briar

# briar
@chapter Chapter Four|The Briarwood
@hide all
@bg briar
@music unease
@show cuetip neutral left
@set hs=52
Night four. The road out of Thistledown climbs into the Briarwood, a forest of thorns arching overhead like the ribs of something huge.
The moon is fatter. The marks are past his shoulder again.
@sfx slam
@show ozzie smile right
ozzie: BLUEBERRY!
@show kit smile center
kit: Told you he'd be on time. Pay up.
ozzie: I DIDN'T BET. You just took my money.
@face kit neutral
kit: We found her road. It goes through here, over the Bridge of Needles, and up to some garden at the top of the moon road. And it's crawling with...
@sfx whisper
@fx shake
@face kit angry
kit: ...those.
@hide all
@show cuetip angry left
Figures in black-violet armour step out from the thorns. Helmets with thorn crowns, visors burning magenta, moving like puppets on very short strings.
cuetip: Thorn Knights.
ozzie: Go on, champ. We're right behind you. Literally. Call us when you need us.
@battle knights
@show kit sad right
The last knight falls. Kit kneels by it and lifts the visor.
Underneath is a badger. An ordinary badger, unconscious, with black HS marks on his cheek and thorny vines grown up out of his collar like weeds.
@face cuetip surprised
cuetip: That's a person.
kit: They're all people. Every one of them.
@face kit angry
kit: I've seen this before. I was a Rot Knight, remember? This is how Vexmoor got recruits. Find someone sick and scared. Promise them it all goes away.
kit: Except the thorns don't take the curse away. They just stop you from feeling it, right up until you stop feeling anything.
@face cuetip sad
cuetip: "A cure." She's been offering people a cure.
@face kit neutral
kit: And there's a porcupine knight on the Bridge of Needles who's been bragging to the others that he's her favourite.
@chapter Chapter Five|The Bridge of Needles

# quill
@hide all
@bg bridge
@music unease
@set hs=56
@show cuetip neutral left
The Bridge of Needles is a single strip of stone over a canyon full of mist, its railings bristling with spikes as long as swords.
@show quill angry right
@alias quill ???
quill: Turn back.
A porcupine in violet armour stands in the middle of the bridge, quills fanned wide, a lance in his hands. Thorny vines climb out of his collar, up his neck, toward his face.
cuetip: You're Quill. Pip's brother.
@face quill surprised
@alias quill Sir Quill
quill: ...You know Pip? Is he okay? Is he...
@face quill angry
quill: No. It doesn't matter. Lady Nightshade cured me. No more shots. No more marks. When the moon's full, she'll cure everyone. Pip too.
cuetip: Those aren't your marks going away. Look at your neck, Quill. That's thorns.
quill: Better thorns than needles!
@face quill sad
quill: Better than being the sick kid forever.
@face cuetip angry
cuetip: Pip took his shot today.
@face quill surprised
cuetip: All by himself. Walked into the tent and did it. Said it was just a pinch. He was so proud he could barely stand still.
@face quill angry
quill: SHUT UP!
@battle quill

# quill_after
@show quill hurt right
@show cuetip hurt left
Quill's lance clatters across the stone. He sinks to his knees, and the thorns on his neck writhe, reaching for his face.
quill: It's spreading. Why is it spreading? She said... she said...
@show pip surprised center
pip: QUILL!
@show moss neutral center
@hide pip
Pip, who was absolutely told to stay in Thistledown, comes sprinting across the bridge with Dr. Moss flapping frantically behind him.
moss: I tried to stop him. He's very fast. He's very *pointy*.
@face moss sad
She kneels by Quill and looks at the thorns for a long moment.
moss: I can stop the thorns. With the real medicine. But it won't erase what was there before. The HS marks will still be there.
@face quill sad
quill: So I'd be... like him. Marked. Taking shots. Forever.
@hide moss
@show pip neutral center
pip: Like me.
* "Like us. It's not so bad. The company's great." -> qu_a ; bonds+1
* "You picked the wrong cure. Pick again." -> qu_b
* Say nothing. Let Pip handle it. -> qu_c ; bonds+1

# qu_a
@face quill sad
quill: ...You really think so?
cuetip: I've got a porch, a garden, a wife, a hammock with a tortoise in it, and a medicine bag. Yeah. I think so.
@jump qu_end

# qu_b
@face quill hurt
quill: ...Yeah. Yeah, I did.
@jump qu_end

# qu_c
@face pip smile
pip: It's just a pinch, Quill. I did it today. I can hold your hand if you want. You held mine at the dentist.
@face quill sad
@jump qu_end

# qu_end
@show moss neutral center
@hide pip
Quill holds out his arm. Dr. Moss gives him the shot.
@sfx shot
The thorns stop moving. One by one, they go brittle and fall away, leaving behind black marks on his neck, still and quiet. He touches them like he's meeting them for the first time.
@face quill neutral
quill: That's it? That's all it was?
moss: That's all it ever is, sweetheart. Again next week.
@hide moss
@face quill sad
quill: She gave me something to guard. Said it was the most precious thing she owned.
He reaches into his armour and pulls out a small star, flickering.
@clue
quill: The last one is in her garden. Inside the Bloom. And Cuetip... she's going to offer you what she offered me. She'll make it sound so easy.
@face cuetip neutral
cuetip: Somebody already warned me. No cure asks you to kneel.
@chapter Chapter Six|The Withering Garden

# garden
@hide all
@bg garden
@music unease
@set hs=60
@show cuetip hurt center
Night seven.
The moon road climbs out of the mist and into a garden that was beautiful once: marble arches, fountains, roses. Now the roses are black and taller than houses, and the moon fills half the sky.
The marks have reached Cuetip's neck. Each breath is a little harder than the last.
He takes his shot. He keeps walking.
@face cuetip angry
At the centre of the garden, something huge unfolds: a black rose with a mouth full of teeth, its stem bristling with purple thorns. Deep inside it, past the teeth, a small star flickers.
cuetip: Seriously? Inside the flower? Of course it's inside the flower.
@battle bloom
@sfx break
@fx flash
The Bloom collapses in a rain of black petals. The last seed rises out of the wreckage and settles into Cuetip's hand.
@clue
Three stars, warm in his palm. Next to them, the braid on his wrist begins to glow.
@chapter Final Chapter|The Moon Throne

# throne
@hide all
@bg throne2
@music boss
@set hs=62
@show nightshade smile right
@show cuetip angry left
nightshade: You came all the way up here. With my seeds. That's so thoughtful.
nightshade: You know, I like you, bunny. I'll make you a better offer than I made the porcupine.
@face nightshade dark
nightshade: No thorns. No shots. No marks. No more Sundays on that sad little porch, poking yourself with needles. Gone. All of it.
nightshade: All you have to do is kneel. And wear the crown, once I'm done with it.
* "No." -> refuse
* "...No more shots? Ever?" -> tempt

# tempt
@face cuetip sad
For one second, he lets himself imagine it. No vials. No bad days. No marks.
@face nightshade smile
nightshade: Ever. I promise.
* Think of Pip, walking out of the tent with his sleeve rolled up. -> refuse
* Take her hand. -> easy_way

# easy_way
@music lull
@face cuetip neutral
He takes her hand. It's cold.
@fx red
@set hs=0
The black marks fade from his skin, one by one, and for a moment he feels light, so light...
@face nightshade dark
...and then the thorns come up through his collar, and he stops feeling anything at all.
@hide all
@bg blightree
The moon is full. Across the world, the marked kneel.
Far away, beneath a grey tree, a woman with very long hair keeps her hands on the bark, and waits.
And waits.
@end thorned

# refuse
@face cuetip angry
cuetip: No.
@face nightshade angry
cuetip: I've taken my shot every Sunday for a year. On my sad little porch. You know what that bought me? A year.
cuetip: A garden full of weeds. A tortoise in my hammock. A kid in an enormous scarf who isn't scared anymore. *Her*.
cuetip: I'll take the pinch.
@face nightshade dark
nightshade: Then I'll take *you*.
@battle nightshade

# moonfall
@hide all
@show nightshade hurt right
@fx shake
Nightshade staggers back against her throne, gown torn, the silver seams of her crown sparking.
nightshade: You stubborn... fine. FINE. If you won't kneel, I'll make you.
@face nightshade dark
She tears the crown off her head and holds it up to the moon. The moon *answers*. Violet light pours down into the thorns, into her, until her eyes burn like two small moons.
@fx red
@music unease
@set hs=88
@show cuetip hurt left
Cuetip drops. The marks on his body light up all at once, pulling, pulling, every one of them trying to drag him down onto his knees.
cuetip: Can't... too much...
@face cuetip sad
His medicine bag. His hand won't reach it. Everything is going dark at the edges.
@sfx whisper
Then a voice. Very small. Very loud.
@show pip angry center
pip: GET UP, CUETIP!
@hide pip
@sfx slam
@fx shake
@show ozzie angry right
ozzie: YOU HEARD THE KID!
@hide ozzie
@show kit angry right
kit: On your feet, blue! You've still got dishes to do!
@hide kit
@show rook stern right
rook: I said I don't do travel. I lied. Ward up, rabbit.
@hide rook
@show quill neutral right
quill: She's lying about everything. Don't you dare kneel.
@hide quill
@show moss neutral right
Dr. Moss lands beside him, and a needle goes into his arm, quick and sure.
@sfx shot
@set hs=25
moss: There. Medicine in. Breathe, sweetheart. *Breathe.*
@face cuetip angry
@if bonds>=3 -> moon_bonds
@jump moon_fight

# moon_bonds
@face moss smile
moss: And one more for the road. I always pack a spare for you. You know that.
@jump moon_fight

# moon_fight
@hide moss
@show nightshade dark right
Cuetip stands up. The braid on his wrist and the three stars in his fist are burning so bright he can see the bones in his own fingers.
nightshade: You can't win, bunny. You're SICK. You'll always be sick.
cuetip: Yeah. And I'm still standing.
@battle final

# victory
@hide all
@show nightshade hurt right
@show cuetip angry left
@fx flash
@sfx break
Cuetip raises the braid and the three seeds together, and the curse comes home.
Every bolt of rot, every thorn, every mark she meant to wake, all of it turns around and pours back into her, back up into the moon it came from.
nightshade: No. No, no, you're supposed to want to be *fixed*!
cuetip: I'm not broken. I've got a curse, a weekly shot and a lot of friends. That's a whole life.
@fx shake
@sfx crash
The Blight Moon cracks. Then it shatters, and falls across the sky in a thousand violet shooting stars that fade to white before they touch the ground.
@hide nightshade
Lady Nightshade comes apart into a drift of purple petals, and the wind takes them.
The crown hits the floor. It's still twitching.
@show ozzie angry right
ozzie: Oh, NO you don't.
@sfx heavyhit
@fx shake
Ozzie plants his feet, breathes in, holds it, holds it, holds it... and puts his fist through the crown of thorns so hard there's nothing left but black dust.
ozzie: MOUNTAIN. FALLING.
@hide ozzie
@show cuetip smile left
And all across the world, the marks go still.
In Thistledown, the baker stops shaking. On the Bridge of Needles, the Thorn Knights wake up in a pile of brittle vines, blinking, marked and alive.
@chapter Epilogue|Home

# finale
@hide all
@bg home
@music dawn
@amb stop
He gets home at dawn.
The Star Tree is grey and drooping, and Bramble is asleep in front of it with his staff across his knees. And she is exactly where he left her, both hands on the bark, hair lifting in a wind that isn't there.
Seven nights. She never let go.
@show bride neutral center
@show cuetip sad left
cuetip: I'm home.
bride: I know. I felt the moon break.
@set hs=20
Cuetip holds up the three seeds. They float out of his hand and into the tree, and the Star Tree takes a long, deep breath.
@fx flash
@sfx shard
Light runs up the trunk and into every branch. The grey leaves turn silver, then gold. Somewhere above them, the tree starts to hum.
@show bride reach center
She lets go of the bark at last, and sways, and reaches back without turning around, and finds his hand.
Her fingers find the braid on his wrist.
bride: You kept it on.
@face cuetip smile
cuetip: Never taking it off.
bride: Did you complain about the garden?
cuetip: Not once. I was very busy. There was a moon.
@music tender
She laughs. Her shoulders do the thing.
@hide all
@show cuetip smile left
@show pip smile right
It's Sunday.
There are two of them on the porch step now. One blue, one spiky, both with their sleeves rolled up.
pip: Ready?
cuetip: Ready.
A pinch. Done. Pip doesn't even wince anymore. He insists on a sticker anyway.
@show quill smile center
Quill comes too, most Sundays. Dr. Moss comes to all of them. Kit comes for the breakfast, Ozzie comes for second breakfast, and Bramble was never not there.
@hide quill
And she stands at the edge of the porch, looking out at the tree, never turning around while anyone else might see.
@hide all
@bg peaks
@music unease
Far away, in the Hollow Peaks, a raven reads a letter by lamplight. Then he reads it again.
@show rook stern center
rook: ...Across the sea? Somebody's been *collecting* them?
rook: Oh, the rabbit is going to hate this.
@sfx whisper
@end home
`;

const ENDINGS = {
  home: { title: "Home", kind: "Vol. 2 Complete", hint: "Bring the seeds home." },
  thorned: { title: "The Easy Way", kind: "Bad Ending", hint: "Take what she offers." },
};
