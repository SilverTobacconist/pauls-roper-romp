const prompt = (id, label, example, mustComeAfter) => ({
  id,
  label,
  example,
  ...(mustComeAfter ? { mustComeAfter } : {}),
})

const scene = (text) => ({ type: 'scene-heading', text })

const stage = (...parts) => ({
  type: 'stage-direction',
  parts,
})

const dialogue = (speaker, ...parts) => ({
  type: 'dialogue',
  speaker,
  parts,
})

const answer = (answerId) => ({ answerId })

const lostScripts = [
  {
    id: 'refrigerator-mystery',
    title: 'The Refrigerator Mystery',
    teaser:
      'Jack insists the creature in the refrigerator is perfectly normal.',
    archiveNumber: 'LS-201-01',

    prompts: [
      prompt('animal', 'Animal', 'ostrich'),
      prompt('nationality', 'Nationality', 'Norwegian'),
      prompt('plural-noun', 'Plural Noun', 'bowling shoes'),
      prompt('body-part', 'Body Part', 'kneecap'),
      prompt('occupation', 'Occupation', 'dentist'),
      prompt('number', 'Number', '47'),
      prompt('verb-ing', 'Verb Ending in “-ing”', 'square dancing'),
      prompt('funny-sound', 'Funny Sound', 'sploink'),
      prompt(
        'another-plural-noun',
        'Another Plural Noun',
        'tax returns',
        'plural-noun',
      ),
      prompt('adjective', 'Adjective', 'suspicious'),
    ],

    blocks: [
      scene('INT. APARTMENT 201 – EVENING'),

      stage(
        'JANET stands in front of the open refrigerator, holding a pair of ',
        answer('plural-noun'),
        '. JACK enters carrying a grocery bag.',
      ),

      dialogue(
        'JANET',
        'Jack, would you please explain why there is a ',
        answer('animal'),
        ' sitting on the second shelf?',
      ),

      dialogue(
        'JACK',
        'That is not a ',
        answer('animal'),
        '. That is a ',
        answer('nationality'),
        ' delicacy.',
      ),

      dialogue('JANET', 'It just blinked at me.'),

      dialogue('JACK', 'That proves it’s fresh.'),

      stage(
        'CHRISSY enters wearing a hat made from ',
        answer('another-plural-noun'),
        '.',
      ),

      dialogue(
        'CHRISSY',
        'Has anybody seen my ',
        answer('body-part'),
        ' moisturizer?',
      ),

      dialogue('JANET', 'Your what?'),

      dialogue(
        'CHRISSY',
        'My ',
        answer('body-part'),
        ' moisturizer. The bottle says it makes everything look ten years younger.',
      ),

      dialogue('JACK', 'Then give some to the couch.'),

      stage(
        'LARRY rushes through the front door carrying a large covered tray.',
      ),

      dialogue(
        'LARRY',
        'I need a favor. My date thinks I’m a professional ',
        answer('occupation'),
        ', and she’ll be here in ',
        answer('number'),
        ' minutes.',
      ),

      dialogue('JANET', 'Why would she think that?'),

      dialogue('LARRY', 'Because I told her.'),

      dialogue('JACK', 'Solid foundation for a relationship.'),

      stage(
        'The refrigerator door slowly swings open. The ',
        answer('animal'),
        ' jumps onto Larry’s tray.',
      ),

      dialogue('LARRY', 'My dinner!'),

      dialogue('JANET', 'Why was your dinner covered?'),

      dialogue(
        'LARRY',
        'Because it was still ',
        answer('verb-ing'),
        ' when I put the lid on it.',
      ),

      stage('MR. ROPER enters without knocking.'),

      dialogue('MR. ROPER', 'What is all this noise?'),

      stage(
        'Everyone freezes. The ',
        answer('animal'),
        ' lets out a loud ',
        answer('funny-sound'),
        '.',
      ),

      dialogue(
        'MR. ROPER',
        'Jack, I knew something extremely ',
        answer('adjective'),
        ' was happening in this apartment.',
      ),

      dialogue('JACK', 'Mr. Roper, I can explain.'),

      dialogue('MR. ROPER', 'Good. Start with the hat.'),

      stage('CHRISSY smiles proudly.'),

      dialogue(
        'CHRISSY',
        'You like it? It’s made from genuine ',
        answer('another-plural-noun'),
        '.',
      ),

      stage(
        'Mr. Roper slowly looks toward the audience. The ',
        answer('animal'),
        ' steals Larry’s dinner and runs out the door.',
      ),

      dialogue('LARRY', 'There goes my date.'),

      dialogue('JANET', 'That was your date?'),

            dialogue(
        'LARRY',
        'Honestly… it was the healthiest relationship I’ve had all year.',
      ),

      stage('Freeze Frame.'),
    ],
  },

  {
    id: 'larrys-big-date',
    title: 'Larry’s Big Date',
    teaser:
      'One small lie gives Larry a career, an award, and nowhere left to hide.',
    archiveNumber: 'LS-201-02',

    prompts: [
      prompt('occupation', 'Occupation', 'surgeon'),
      prompt('number', 'Number', '19'),
      prompt('adjective', 'Adjective', 'majestic'),
      prompt('celebrity', 'Celebrity', 'Cher'),
      prompt('food', 'Food', 'lasagna'),
      prompt('place', 'Place', 'Cleveland'),
      prompt('verb-ing', 'Verb Ending in “-ing”', 'hibernating'),
      prompt('award', 'Award', 'Golden Spatula'),
      prompt('exclamation', 'Exclamation', 'Great gravy'),
      prompt('beverage', 'Beverage', 'prune juice'),
    ],

    blocks: [
      scene('INT. APARTMENT 201 – EVENING'),

      stage('LARRY paces nervously.'),

      dialogue('LARRY', 'Jack… Janet… I need a favor.'),

      dialogue('JANET', 'What happened this time?'),

      dialogue('LARRY', 'I may have… stretched the truth a tiny bit.'),

      dialogue('JACK', 'How tiny?'),

      dialogue(
        'LARRY',
        'I told my date I’m a successful ',
        answer('occupation'),
        '.',
      ),

      dialogue('JANET', 'Are you?'),

      dialogue('LARRY', 'Does confidence count?'),

      stage('A knock at the door.'),

      dialogue(
        'LARRY',
        'Everybody… please… that’s the ONLY lie.',
      ),

      stage('JACK nods. LARRY opens the door.'),

      dialogue(
        'DATE',
        'Larry! It’s so nice to finally meet everyone!',
      ),

      dialogue('JACK', 'Larry talks about you all the time.'),

      dialogue('LARRY', 'Jack…'),

      dialogue(
        'JACK',
        'Mostly because you haven’t shown up yet.',
      ),

      stage('LARRY exhales. Good. False alarm.'),

      dialogue(
        'DATE',
        'Larry says work keeps him very busy.',
      ),

      dialogue(
        'CHRISSY',
        'Well sure! He just won the ',
        answer('number'),
        'th Annual ',
        answer('occupation'),
        ' ',
        answer('award'),
        '!',
      ),

      stage('LARRY slowly closes his eyes.'),

      dialogue('LARRY', 'Chrissy…'),

      dialogue('JANET', 'She means employee of the month.'),

      dialogue('JACK', 'Three years in a row.'),

      dialogue('JANET', 'Jack!'),

      dialogue('DATE', 'Really?'),

      dialogue(
        'JACK',
        'People stop him on the street constantly.',
      ),

      dialogue(
        'LARRY',
        'Nobody has ever stopped me on the street.',
      ),

      dialogue('JACK', 'Exactly. You’re so humble.'),

      dialogue('DATE', 'I had no idea.'),

      dialogue(
        'CHRISSY',
        'He even met ',
        answer('celebrity'),
        '!',
      ),

      dialogue(
        'LARRY',
        'I saw them… across a parking lot.',
      ),

      dialogue('CHRISSY', 'That’s practically meeting.'),

      dialogue(
        'DATE',
        'Larry, why didn’t you tell me all this?',
      ),

      dialogue('LARRY', 'Because none of it is…'),

      stage('JACK steps on LARRY’s foot.'),

      dialogue('LARRY', '…important.'),

      stage('MR. ROPER enters carrying an envelope.'),

      dialogue(
        'MR. ROPER',
        'Larry, your rent check bounced higher than I’ve ever seen.',
      ),

      stage('Beat.'),

      dialogue(
        'MR. ROPER',
        'For a minute I thought you were rich.',
      ),

      stage('Nobody speaks.'),

      dialogue(
        'MR. ROPER',
        'Then I remembered who I was thinking about.',
      ),

      dialogue('DATE', 'So… what exactly do you do?'),

      stage('Everyone answers at once.'),

      dialogue('JACK', 'He’s a respected professional.'),

      dialogue('JANET', 'He’s doing very well.'),

      dialogue('CHRISSY', 'He’s famous!'),

      dialogue(
        'LARRY',
        'I make ',
        answer('beverage'),
        ' commercials.',
      ),

      stage('Everyone turns and stares at LARRY.'),

      dialogue('LARRY', 'I panicked.'),

      dialogue(
        'DATE',
        'Larry… Is anything you’ve told me true?',
      ),

      stage('Long pause.'),

      dialogue(
        'LARRY',
        'I like ',
        answer('food'),
        '.',
      ),

      stage('She sighs.'),

      dialogue('DATE', 'At least that’s believable.'),

      stage('She exits.'),

      dialogue(
        'MR. ROPER',
        'Larry… I’ve known you for years. That was the most ',
        answer('adjective'),
        ' performance I’ve ever seen.',
      ),

      dialogue(
        'LARRY',
        'Do you think she’ll ever speak to me again?',
      ),

      dialogue(
        'MR. ROPER',
        'Only if she’s ',
        answer('verb-ing'),
        '.',
      ),

      stage('Beat.'),

      dialogue(
        'JACK',
        'Look on the bright side. You never have to pretend you visited ',
        answer('place'),
        '.',
      ),

      dialogue('LARRY', '…I actually have been there.'),

      stage('Everyone stares.'),

      dialogue(
        'LARRY',
        answer('exclamation'),
        '!',
      ),

      stage('Freeze Frame.'),
    ],
  },
    {
    id: 'jack-cooks-dinner',
    title: 'Jack Cooks Dinner',
    teaser:
      'Jack’s elegant dinner begins fighting back before the guests arrive.',
    archiveNumber: 'LS-201-03',

    prompts: [
      prompt('food', 'Food', 'meatloaf'),
      prompt('adjective', 'Adjective', 'furious'),
      prompt('kitchen-tool', 'Kitchen Tool', 'whisk'),
      prompt('body-part', 'Body Part', 'eyebrow'),
      prompt('liquid', 'Liquid', 'motor oil'),
      prompt('number', 'Number', '28'),
      prompt('action', 'Action', 'tap dancing'),
      prompt('occupation', 'Occupation', 'taxidermist'),
      prompt('household-object', 'Household Object', 'lamp'),
      prompt('exclamation', 'Exclamation', 'Holy mackerel'),
    ],

    blocks: [
      scene('INT. APARTMENT 201 – EVENING'),

      stage(
        'JACK stands over the stove wearing an apron and holding a ',
        answer('kitchen-tool'),
        '. JANET enters and sniffs cautiously.',
      ),

      dialogue('JANET', 'What are you cooking?'),

      dialogue(
        'JACK',
        answer('food'),
        '.',
      ),

      dialogue(
        'JANET',
        'Is it supposed to smell that ',
        answer('adjective'),
        '?',
      ),

      dialogue('JACK', 'That’s the weakness leaving.'),

      stage(
        'CHRISSY enters with a dab of ',
        answer('liquid'),
        ' on her ',
        answer('body-part'),
        '.',
      ),

      dialogue(
        'CHRISSY',
        'Jack, your recipe said to let it rest.',
      ),

      dialogue(
        'JACK',
        'It has been resting for ',
        answer('number'),
        ' minutes.',
      ),

      dialogue(
        'CHRISSY',
        'Then why is it ',
        answer('action'),
        '?',
      ),

      stage(
        'The pot lid jumps. JANET takes a step back.',
      ),

      dialogue(
        'JANET',
        'Maybe dinner isn’t finished resting.',
      ),

      stage('LARRY enters carrying flowers.'),

      dialogue(
        'LARRY',
        'I told my date you were a professional ',
        answer('occupation'),
        '.',
      ),

      dialogue(
        'JACK',
        'Why would you tell her that?',
      ),

      dialogue(
        'LARRY',
        'Because “my friend is cooking” didn’t sound dangerous enough.',
      ),

      stage(
        'The ',
        answer('household-object'),
        ' rattles.',
      ),

      dialogue(
        'CHRISSY',
        'Was that part of the recipe?',
      ),

      dialogue(
        'JACK',
        'Not the printed part.',
      ),

      stage(
        'MR. ROPER enters. The pot erupts with a puff of steam.',
      ),

      dialogue(
        'MR. ROPER',
        answer('exclamation'),
        '!',
      ),

      dialogue(
        'MR. ROPER',
        'What are you doing up here?',
      ),

      dialogue(
        'JACK',
        'Making dinner.',
      ),

      dialogue(
        'MR. ROPER',
        'Then why is the furniture trying to leave?',
      ),

      stage('Freeze Frame.'),
    ],
  },

  {
    id: 'wrong-suitcase',
    title: 'The Wrong Suitcase',
    teaser:
      'A borrowed suitcase contains everything except what anyone expects.',
    archiveNumber: 'LS-201-04',

    prompts: [
      prompt('clothing', 'Clothing', 'tuxedo'),
      prompt('food', 'Food', 'pickled herring'),
      prompt('toy', 'Toy', 'yo-yo'),
      prompt('occupation', 'Occupation', 'magician'),
      prompt('celebrity', 'Celebrity', 'Elvis Presley'),
      prompt('number', 'Number', '36'),
      prompt(
        'destination',
        'Vacation Destination',
        'Niagara Falls',
      ),
      prompt(
        'instrument',
        'Musical Instrument',
        'tuba',
      ),
      prompt('sport', 'Sport', 'bowling'),
      prompt(
        'exclamation',
        'Exclamation',
        'Jumping jellybeans',
      ),
    ],

    blocks: [
      scene('INT. APARTMENT 201 – AFTERNOON'),

      stage(
        'A suitcase sits open on the couch. JANET holds up a piece of ',
        answer('clothing'),
        ' while CHRISSY removes a container of ',
        answer('food'),
        '.',
      ),

      dialogue(
        'JANET',
        'Jack said this was his suitcase.',
      ),

      dialogue(
        'CHRISSY',
        'Maybe he packs when he’s hungry.',
      ),

      stage(
        'She pulls out a ',
        answer('toy'),
        '.',
      ),

      dialogue(
        'JANET',
        'Or when he’s six.',
      ),

      stage('JACK enters.'),

      dialogue(
        'JACK',
        'Please tell me you found my blue shirt.',
      ),

      dialogue(
        'JANET',
        'We found enough evidence to start a trial.',
      ),

      dialogue(
        'CHRISSY',
        'Are you secretly a ',
        answer('occupation'),
        '?',
      ),

      dialogue(
        'JACK',
        'That isn’t my suitcase.',
      ),

      stage('LARRY rushes in.'),

      dialogue(
        'LARRY',
        'Has anyone seen a suitcase with ',
        answer('celebrity'),
        '’s initials on it?',
      ),

      dialogue(
        'JANET',
        'Why would you have that?',
      ),

      dialogue(
        'LARRY',
        'Long story. I have ',
        answer('number'),
        ' minutes before the bus leaves for ',
        answer('destination'),
        '.',
      ),

      stage(
        'A muffled note sounds from inside the suitcase.',
      ),

      dialogue(
        'CHRISSY',
        'Did the suitcase just play a ',
        answer('instrument'),
        '?',
      ),

      stage(
        'MR. ROPER enters as the telephone rings. JANET answers.',
      ),

      dialogue(
        'JANET',
        'Hello? …Yes, we have it.',
      ),

      stage('She listens.'),

      dialogue(
        'JANET',
        'Larry, he wants to know what happened to the food.',
      ),

      dialogue(
        'LARRY',
        'I ate it.',
      ),

      stage(
        'CHRISSY reaches into the suitcase and pulls out a ',
        answer('sport'),
        ' trophy.',
      ),

      dialogue(
        'CHRISSY',
        answer('exclamation'),
        '!',
      ),

      dialogue(
        'JACK',
        'Chrissy… I don’t think that’s ours either.',
      ),

      dialogue(
        'MR. ROPER',
        'Just once I’d like to walk in here and find something normal.',
      ),

      stage('Freeze Frame.'),
    ],
  },
    {
    id: 'television-commercial',
    title: 'The Television Commercial',
    teaser:
      'Larry attempts to sell America a product no one can identify.',
    archiveNumber: 'LS-201-05',

    prompts: [
      prompt('reading-material', 'Reading Material', 'phone book'),
      prompt('thing', 'Thing', 'toaster'),
      prompt('plural-noun', 'Plural Noun', 'turnips'),
      prompt('facial-feature', 'Facial Feature', 'eyebrows'),
      prompt('business', 'Business', 'laundromat'),
      prompt('country', 'Country', 'Belgium'),
      prompt('adjective', 'Adjective', 'relatable'),
      prompt('life-event', 'Life Event', 'retirement'),
      prompt('container', 'Type of Container', 'cereal box'),
      prompt('abstract-noun', 'Abstract Noun', 'initiative'),
    ],

    blocks: [
      scene('INT. APARTMENT 201 – DAY'),

      stage(
        'JACK enters carrying a folded ',
        answer('reading-material'),
        ' and a grocery bag containing ',
        answer('plural-noun'),
        '. JANET is reading on the couch. CHRISSY is watering a ',
        answer('thing'),
        '.',
      ),

      dialogue(
        'JACK',
        'You two are looking at the future.',
      ),

      dialogue(
        'JANET',
        'Should I be impressed or worried?',
      ),

      dialogue(
        'JACK',
        'Impressed. There’s an audition downtown for a television commercial.',
      ),

      dialogue(
        'CHRISSY',
        'Really? What kind of commercial?',
      ),

      dialogue(
        'JACK',
        'It doesn’t say. Just “looking for friendly, ',
        answer('adjective'),
        ' people.”',
      ),

      dialogue(
        'JANET',
        'Well, you’re halfway there.',
      ),

      dialogue(
        'JACK',
        'Which half?',
      ),

      dialogue(
        'JANET',
        'I’ll let the casting director decide.',
      ),

      stage(
        'LARRY bursts through the front door without knocking.',
      ),

      dialogue(
        'LARRY',
        'Jack! Tell me you haven’t gone yet!',
      ),

      dialogue(
        'JACK',
        'Gone where?',
      ),

      dialogue(
        'LARRY',
        'The audition! I’m perfect for commercials. People trust these ',
        answer('facial-feature'),
        '.',
      ),

      stage(
        'JANET and JACK exchange a look.',
      ),

      dialogue(
        'JANET',
        'Do they?',
      ),

      dialogue(
        'LARRY',
        'Absolutely. I’ve got what they call… “camera charisma.”',
      ),

      dialogue(
        'CHRISSY',
        'What’s camera charisma?',
      ),

      dialogue(
        'JACK',
        'It’s what people say when they can’t think of anything else.',
      ),

      stage(
        'A knock at the door. MR. ROPER enters carrying a clipboard.',
      ),

      dialogue(
        'MR. ROPER',
        'Morning. Anybody seen a man from the ',
        answer('business'),
        '?',
      ),

      dialogue(
        'JANET',
        'No.',
      ),

      dialogue(
        'MR. ROPER',
        'Good. He owes me five minutes.',
      ),

      stage(
        'He notices the ',
        answer('reading-material'),
        '.',
      ),

      dialogue(
        'MR. ROPER',
        'What’s this?',
      ),

      dialogue(
        'JACK',
        'Commercial auditions.',
      ),

      dialogue(
        'MR. ROPER',
        'You? On television?',
      ),

      dialogue(
        'JACK',
        'Why not?',
      ),

      dialogue(
        'MR. ROPER',
        'I was just wondering who lost the bet.',
      ),

      dialogue(
        'CHRISSY',
        'I think Jack would be wonderful on television.',
      ),

      dialogue(
        'LARRY',
        'I’d be better. I’ve got memorable ',
        answer('facial-feature'),
        '.',
      ),

      dialogue(
        'MR. ROPER',
        'So does my dentist. I still don’t enjoy seeing him.',
      ),

      dialogue(
        'MR. ROPER',
        'I’ve always said you have a face for radio.',
      ),

      stage(
        'MR. ROPER looks toward the audience.',
      ),

      dialogue(
        'LARRY',
        'Watch this. “Larry Commercial Face.”',
      ),

      stage(
        'He flashes an exaggerated smile and points both thumbs toward himself. Silence.',
      ),

      dialogue(
        'JANET',
        'Is that… it?',
      ),

      dialogue(
        'LARRY',
        'That’s the look ',
        answer('country'),
        ' remembers.',
      ),

      dialogue(
        'JACK',
        answer('country'),
        ' may need another look.',
      ),

      dialogue(
        'CHRISSY',
        'I’ve got it! Let’s make our own commercial!',
      ),

      dialogue(
        'JANET',
        'For what?',
      ),

      dialogue(
        'CHRISSY',
        'Anything! If it’s good enough, they’ll hire us.',
      ),

      dialogue(
        'JACK',
        'That’s not really how auditions work.',
      ),

      dialogue(
        'CHRISSY',
        'Maybe they’ll appreciate the ',
        answer('abstract-noun'),
        '.',
      ),

      dialogue(
        'LARRY',
        'I like ',
        answer('abstract-noun'),
        '. It sounds expensive.',
      ),

      stage(
        'JACK grabs an empty ',
        answer('container'),
        ' from the kitchen.',
      ),

      dialogue(
        'JACK',
        'Fine. Pretend this is the product. Sell it.',
      ),

      dialogue(
        'LARRY',
        'Friends… I’ve tried everything. Nothing changed my ',
        answer('life-event'),
        '… until this.',
      ),

      stage(
        'He dramatically lifts the empty ',
        answer('container'),
        '.',
      ),

      dialogue(
        'LARRY',
        'I can’t tell you what it is… because then you’d all want one.',
      ),

      stage('Beat.'),

      dialogue(
        'JANET',
        'It’s an empty ',
        answer('container'),
        '.',
      ),

      dialogue(
        'LARRY',
        'Exactly. People love mystery.',
      ),

      dialogue(
        'MR. ROPER',
        'Larry… If you ever sell something to me… I’m reading the warranty first.',
      ),

      dialogue(
        'CHRISSY',
        'I think we all learned something today.',
      ),

      dialogue(
        'JACK',
        'I know I did. Never let Larry write commercials.',
      ),

      dialogue(
        'MR. ROPER',
        'Too late. He just sold me on staying home.',
      ),

      stage('Freeze Frame.'),
    ],
  },

  {
    id: 'apartment-inspector',
    title: 'The Apartment Inspector',
    teaser:
      'A routine inspection turns every harmless object into suspicious evidence.',
    archiveNumber: 'LS-201-06',

    prompts: [
      prompt('object', 'Object', 'umbrella'),
      prompt('furniture', 'Piece of Furniture', 'ottoman'),
      prompt('beverage', 'Beverage', 'root beer'),
      prompt('chemical', 'Chemical', 'ammonia'),
      prompt('another-object', 'Another Object', 'trombone'),
      prompt('plural-noun', 'Plural Noun', 'garden gnomes'),
      prompt('floor', 'Floor', 'seventeenth'),
      prompt(
        'another-plural-noun',
        'Another Plural Noun',
        'rubber ducks',
        'plural-noun',
      ),
      prompt('noun', 'Noun', 'honesty'),
      prompt(
        'personality-trait',
        'Personality Trait',
        'patience',
      ),
    ],

    blocks: [
      scene('INT. APARTMENT 201 – MORNING'),

      stage(
        'CHRISSY is straightening an ',
        answer('object'),
        ' on a ',
        answer('furniture'),
        '. JANET carries a tray with ',
        answer('beverage'),
        '.',
      ),

      dialogue(
        'JANET',
        'Remember, the inspector is only checking the apartment.',
      ),

      dialogue(
        'CHRISSY',
        'Then why did Jack hide the ',
        answer('chemical'),
        '?',
      ),

      dialogue(
        'JANET',
        'Because you labeled it “lemonade.”',
      ),

      stage(
        'JACK enters carrying an ',
        answer('another-object'),
        '.',
      ),

      dialogue(
        'JACK',
        'Nobody panic.',
      ),

      dialogue(
        'JANET',
        'That sentence has never helped.',
      ),

      stage(
        'A firm knock. The INSPECTOR enters with a clipboard.',
      ),

      dialogue(
        'INSPECTOR',
        'Routine building inspection.',
      ),

      dialogue(
        'CHRISSY',
        'We have plenty of ',
        answer('plural-noun'),
        ' if you need any.',
      ),

      dialogue(
        'INSPECTOR',
        'I don’t.',
      ),

      dialogue(
        'JACK',
        'She was just being hospitable.',
      ),

      dialogue(
        'INSPECTOR',
        'I’ll begin with the kitchen and then inspect the ',
        answer('floor'),
        ' floor.',
      ),

      dialogue(
        'JANET',
        'This building only has three floors.',
      ),

      dialogue(
        'INSPECTOR',
        'That’s what concerns me.',
      ),

      stage(
        'LARRY enters carrying a carton of ',
        answer('another-plural-noun'),
        '.',
      ),

      dialogue(
        'LARRY',
        'Jack, where do you want these?',
      ),

      stage(
        'Everyone stares at him.',
      ),

      dialogue(
        'LARRY',
        'Is that a compliment?',
      ),

      dialogue(
        'INSPECTOR',
        'What exactly happens in this apartment?',
      ),

      dialogue(
        'JACK',
        'Mostly ',
        answer('noun'),
        '.',
      ),

      dialogue(
        'JANET',
        'Jack.',
      ),

      dialogue(
        'INSPECTOR',
        'Mr. Tripper, your greatest asset appears to be ',
        answer('personality-trait'),
        '.',
      ),

      dialogue(
        'MR. ROPER',
        'His greatest asset is paying rent. Occasionally.',
      ),

      stage('Freeze Frame.'),
    ],
  },
    {
    id: 'larrys-big-invention',
    title: 'Larry’s Big Invention',
    teaser:
      'Larry unveils a machine whose purpose remains safely unknown.',
    archiveNumber: 'LS-201-07',

    prompts: [
      prompt('equipment', 'Piece of Equipment', 'cash register'),
      prompt('object', 'Object', 'marble'),
      prompt('door-thing', 'Thing with a Door', 'refrigerator'),
      prompt('action', 'Action', 'wobbling'),
      prompt('plural-noun', 'Plural Noun', 'spoons'),
      prompt(
        'another-plural-noun',
        'Another Plural Noun',
        'firecrackers',
        'plural-noun',
      ),
      prompt(
        'another-action',
        'Another Action',
        'sneezing',
        'action',
      ),
      prompt(
        'another-object',
        'Another Object',
        'rubber chicken',
        'object',
      ),
      prompt(
        'negative-emotion',
        'Negative Emotion',
        'disappointment',
      ),
      prompt('number', 'Number', '11'),
    ],

    blocks: [
      scene('INT. THE REGAL BEAGLE – EVENING'),

      stage(
        'The Regal Beagle is fairly quiet. JACK is wiping down a ',
        answer('equipment'),
        '. LARRY sits proudly beside a contraption covered with a towel. JANET and CHRISSY enter.',
      ),

      dialogue(
        'CHRISSY',
        'There you are! You said you had something important to show us.',
      ),

      dialogue(
        'LARRY',
        'Ladies… prepare yourselves. You’re about to witness history.',
      ),

      dialogue(
        'JANET',
        'The last time you said that, you locked yourself in your own ',
        answer('door-thing'),
        '.',
      ),

      dialogue(
        'LARRY',
        'That was a prototype. This… is my future.',
      ),

      stage(
        'He removes the towel. The device is a confusing collection of ',
        answer('plural-noun'),
        ', springs, levers and ',
        answer('another-plural-noun'),
        '.',
      ),

      dialogue(
        'CHRISSY',
        'What is it?',
      ),

      dialogue(
        'LARRY',
        'I’m glad you asked. I haven’t decided yet.',
      ),

      dialogue(
        'JACK',
        'Larry, you invented something before you knew what it was?',
      ),

      dialogue(
        'LARRY',
        'That’s how all the great inventors worked.',
      ),

      stage(
        'MRS. ROPER enters carrying shopping bags and notices the invention.',
      ),

      dialogue(
        'MRS. ROPER',
        'Well… you certainly proved Stanley right about buying things we don’t need.',
      ),

      dialogue(
        'LARRY',
        'This isn’t something you buy. It’s something you experience.',
      ),

      stage(
        'LARRY turns a crank. Nothing happens. He turns it the other way. A tiny bell rings.',
      ),

      dialogue(
        'CHRISSY',
        'Maybe that’s what it does.',
      ),

      dialogue(
        'LARRY',
        'No. That’s just the notification bell.',
      ),

      dialogue(
        'JACK',
        'Notification of what?',
      ),

      dialogue(
        'LARRY',
        'Still working on that.',
      ),

      stage(
        'JACK flips a switch. The machine begins ',
        answer('action'),
        '. ',
        answer('plural-noun'),
        ' behind the bar rattle. Then it starts ',
        answer('another-action'),
        '.',
      ),

      dialogue(
        'LARRY',
        'See? Now we’re getting somewhere.',
      ),

      stage(
        'The machine stops. A puff of smoke rises. It spits a single ',
        answer('object'),
        ' across the bar into JACK’s hand.',
      ),

      dialogue(
        'JACK',
        'Larry… you invented… this?',
      ),

      dialogue(
        'LARRY',
        'No. I invented potential.',
      ),

      dialogue(
        'MRS. ROPER',
        'For another ten, you could’ve bought ',
        answer('negative-emotion'),
        ' already assembled.',
      ),

      stage(
        'JACK sets the ',
        answer('object'),
        ' beside an ',
        answer('another-object'),
        '.',
      ),

      dialogue(
        'JACK',
        'So what’s it called?',
      ),

      dialogue(
        'LARRY',
        'Version Two.',
      ),

      dialogue(
        'JANET',
        'What happened to Version One?',
      ),

      dialogue(
        'LARRY',
        'I learned from Version One.',
      ),

      dialogue(
        'JACK',
        'Did it survive?',
      ),

      dialogue(
        'LARRY',
        '…No.',
      ),

      stage(
        'JACK slowly slides ',
        answer('number'),
        ' dollar(s) across the bar.',
      ),

      dialogue(
        'JACK',
        'Here. Start Version Three.',
      ),

      stage('Freeze Frame.'),
    ],
  },

  {
    id: 'fortune-teller',
    title: 'The Fortune Teller',
    teaser:
      'Jack predicts Larry’s financial future with alarming accuracy.',
    archiveNumber: 'LS-201-08',

    prompts: [
      prompt(
        'reading-material',
        'Reading Material',
        'comic book',
      ),
      prompt(
        'fabric',
        'Type of Fabric',
        'velvet',
      ),
      prompt(
        'occupation',
        'Occupation',
        'doctor',
      ),
      prompt(
        'object',
        'Object',
        'ashtray',
      ),
      prompt(
        'store',
        'Type of Store',
        'pawn shop',
      ),
      prompt(
        'another-occupation',
        'Another Occupation',
        'opera singer',
        'occupation',
      ),
      prompt(
        'body-part',
        'Body Part',
        'elbow',
      ),
      prompt(
        'food',
        'Food',
        'meatballs',
      ),
      prompt(
        'group',
        'Group of People',
        'football team',
      ),
      prompt(
        'number',
        'Number',
        '83',
      ),
    ],

    blocks: [
      scene('INT. APARTMENT 201 – AFTERNOON'),

      stage(
        'CHRISSY is rearranging the living room while JANET sits at the table reading a ',
        answer('reading-material'),
        '. JACK enters carrying a small ',
        answer('fabric'),
        '-covered box.',
      ),

      dialogue(
        'JACK',
        'Ladies… Prepare to have your futures revealed.',
      ),

      dialogue(
        'JANET',
        'Should I call the ',
        answer('occupation'),
        ' now or wait until after the demonstration?',
      ),

      dialogue(
        'CHRISSY',
        'Ooo! Is it magic?',
      ),

      dialogue(
        'JACK',
        'Better. It’s science.',
      ),

      stage(
        'JACK opens the box. Inside is a crystal ball mounted on an ornate ',
        answer('object'),
        '.',
      ),

      dialogue(
        'JANET',
        'Where did you get that?',
      ),

      dialogue(
        'JACK',
        answer('store'),
        '. The guy said it belonged to a famous ',
        answer('another-occupation'),
        '.',
      ),

      dialogue(
        'JANET',
        'The guy at the ',
        answer('store'),
        ' said that?',
      ),

      dialogue(
        'JACK',
        'Well… eventually.',
      ),

      dialogue(
        'CHRISSY',
        'Can it really tell the future?',
      ),

      dialogue(
        'JACK',
        'There’s only one way to find out.',
      ),

      stage(
        'LARRY lets himself in and sits before the crystal ball.',
      ),

      dialogue(
        'LARRY',
        'Who’s telling the future? I’d like next Thursday.',
      ),

      dialogue(
        'JACK',
        'Now… concentrate.',
      ),

      stage(
        'JACK waves his ',
        answer('body-part'),
        ' mysteriously over the crystal ball.',
      ),

      dialogue(
        'LARRY',
        'Anything?',
      ),

      dialogue(
        'JACK',
        'Not yet. Your future must be running a little late.',
      ),

      dialogue(
        'JANET',
        'That’s not how the future works.',
      ),

      dialogue(
        'JACK',
        'How do you know? Have you seen it?',
      ),

      dialogue(
        'CHRISSY',
        'I think I see something!',
      ),

      dialogue(
        'JANET',
        'No… that’s just Jack’s reflection.',
      ),

      stage(
        'MRS. ROPER enters carrying a casserole dish.',
      ),

      dialogue(
        'MRS. ROPER',
        'I made too much ',
        answer('food'),
        ' again. Stanley says I always cook like I’m feeding a ',
        answer('group'),
        '.',
      ),

      dialogue(
        'MRS. ROPER',
        'Stanley bought one of those years ago. It made a wonderful paperweight.',
      ),

      dialogue(
        'JACK',
        'Fine. I’ll prove it. Larry… you’re about to receive unexpected money.',
      ),

      stage(
        'MR. ROPER enters naturally, carrying a receipt.',
      ),

      dialogue(
        'MR. ROPER',
        'Larry… I was going over this month’s rent. You overpaid by five dollars.',
      ),

      dialogue(
        'LARRY',
        'I’m starting to believe you.',
      ),

      dialogue(
        'MRS. ROPER',
        'Jack… maybe that thing works after all.',
      ),

      dialogue(
        'JACK',
        'I told you. Science.',
      ),

      dialogue(
        'MR. ROPER',
        'Not so fast. You still owe me ',
        answer('number'),
        ' dollars from last month.',
      ),

      stage('Freeze Frame.'),
    ],
  },
    {
    id: 'great-pet-sitting-disaster',
    title: 'The Great Pet-Sitting Disaster',
    teaser:
      'A mysterious houseguest has everyone questioning what counts as a pet.',
    archiveNumber: 'LS-201-09',

    prompts: [
      prompt(
        'piece-of-furniture',
        'Piece of Furniture',
        'coffee table',
      ),
      prompt(
        'object',
        'Object',
        'wineglass',
      ),
      prompt(
        'past-tense-verb',
        'Past Tense Verb',
        'winked',
      ),
      prompt(
        'animal',
        'Animal',
        'rabbit',
      ),
      prompt(
        'another-animal',
        'Another Animal',
        'wolverine',
        'animal',
      ),
      prompt(
        'another-object',
        'Another Object',
        'measuring cup',
        'object',
      ),
      prompt(
        'household-object',
        'Household Object',
        'curtains',
      ),
      prompt(
        'food',
        'Food',
        'Meatball',
      ),
      prompt(
        'emotion',
        'Emotion',
        'nervous',
      ),
      prompt(
        'third-animal',
        'Another Animal',
        'hamster',
        'another-animal',
      ),
    ],

    blocks: [
      scene('INT. APARTMENT 201 – AFTERNOON'),

      stage(
        'JANET is reading on the couch while CHRISSY peers nervously into a small pet carrier sitting on the ',
        answer('piece-of-furniture'),
        '. JACK enters from the kitchen drying an ',
        answer('object'),
        '.',
      ),

      dialogue(
        'JACK',
        'Why are you both staring at that thing?',
      ),

      dialogue(
        'CHRISSY',
        'Because it ',
        answer('past-tense-verb'),
        ' at me.',
      ),

      dialogue(
        'JANET',
        'Mrs. Stevens downstairs asked us to watch her pet until this evening.',
      ),

      dialogue(
        'JACK',
        'What kind of pet?',
      ),

      stage(
        'CHRISSY slowly opens the carrier.',
      ),

      dialogue(
        'CHRISSY',
        'We’re… not completely sure.',
      ),

      stage(
        'JACK looks inside. Beat.',
      ),

      dialogue(
        'JACK',
        'That’s either the strangest ',
        answer('animal'),
        ' I’ve ever seen… or the friendliest ',
        answer('another-animal'),
        '.',
      ),

      stage(
        'LARRY lets himself in.',
      ),

      dialogue(
        'LARRY',
        'What’s everybody looking at?',
      ),

      stage(
        'He peeks into the carrier.',
      ),

      dialogue(
        'LARRY',
        'I’m not touching that. Not after what happened at the county fair.',
      ),

      dialogue(
        'JANET',
        'Nobody’s asking you to touch it.',
      ),

      dialogue(
        'LARRY',
        'Good. Because I promised the judge.',
      ),

      stage(
        'The animal suddenly makes an odd noise. Everyone jumps. Except JACK.',
      ),

      dialogue(
        'JACK',
        'Relax. Animals love me.',
      ),

      stage(
        'JACK confidently reaches into the carrier. Beat. A loud screech is heard. JACK jerks his hand back.',
      ),

      dialogue(
        'JACK',
        'It loves me… from a distance.',
      ),

      stage(
        'MRS. ROPER enters carrying a casserole dish.',
      ),

      dialogue(
        'MRS. ROPER',
        'Stanley said I could borrow your ',
        answer('another-object'),
        '.',
      ),

      stage(
        'She notices the carrier.',
      ),

      dialogue(
        'MRS. ROPER',
        'Oh! How adorable! What’s its name?',
      ),

      stage(
        'Everyone looks at each other.',
      ),

      dialogue(
        'JANET',
        'We… forgot to ask.',
      ),

      dialogue(
        'MRS. ROPER',
        'You never asked its name?',
      ),

      dialogue(
        'CHRISSY',
        'We’ve mostly been trying not to upset it.',
      ),

      stage(
        'Another strange noise comes from inside.',
      ),

      dialogue(
        'LARRY',
        'I think we’re past that.',
      ),

      stage(
        'MR. ROPER walks in.',
      ),

      dialogue(
        'MR. ROPER',
        'Helen… Have you seen my…',
      ),

      stage(
        'He notices everyone staring at the carrier. Long pause.',
      ),

      dialogue(
        'MR. ROPER',
        'If that thing pees on the ',
        answer('household-object'),
        ', I’m charging a cleaning fee.',
      ),

      stage(
        'Another pause. A knock at the door. MRS. STEVENS opens the door before anyone answers.',
      ),

      dialogue(
        'MRS. STEVENS',
        'I’m here for Sgt. ',
        answer('food'),
        '!',
      ),

      stage(
        'She reaches into the carrier. The animal immediately becomes calm. She smiles.',
      ),

      dialogue(
        'MRS. STEVENS',
        'He’s always ',
        answer('emotion'),
        ' around strangers.',
      ),

      stage(
        'She leaves. Silence.',
      ),

      dialogue(
        'JACK',
        'That… wasn’t a ',
        answer('third-animal'),
        '.',
      ),

      dialogue(
        'LARRY',
        'I didn’t say it was.',
      ),

      dialogue(
        'MR. ROPER',
        'Nobody did. Which is probably the smartest thing that’s happened in this apartment all day.',
      ),

      stage('Freeze Frame.'),
    ],
  },

  {
    id: 'talent-show',
    title: 'The Talent Show',
    teaser:
      'Larry promises an unforgettable act while Stanley accidentally steals the show.',
    archiveNumber: 'LS-201-10',

    prompts: [
      prompt(
        'plural-object',
        'Plural Object',
        'beer mugs',
      ),
      prompt(
        'action',
        'Action',
        'paces',
      ),
      prompt(
        'something-with-lock',
        'Something with a Lock',
        'cash register',
      ),
      prompt(
        'another-plural-object',
        'Another Plural Object',
        'balloons',
        'plural-object',
      ),
      prompt(
        'adjective',
        'Adjective',
        'remarkable',
      ),
      prompt(
        'article-of-clothing',
        'Article of Clothing',
        'jacket',
      ),
      prompt(
        'another-adjective',
        'Another Adjective',
        'extraordinary',
        'adjective',
      ),
      prompt(
        'exclamation',
        'Exclamation',
        'Sweet mercy',
      ),
      prompt(
        'honorific-title',
        'Honorific Title',
        'Magnificent',
      ),
      prompt(
        'bar-object',
        'Bar Object',
        'cocktail shaker',
      ),
    ],

    blocks: [
      scene('INT. THE REGAL BEAGLE – EVENING'),

      stage(
        'The Regal Beagle is buzzing with customers. A small handmade sign near the stage reads: “Amateur Talent Night.” JACK is polishing ',
        answer('plural-object'),
        ' behind the bar while LARRY ',
        answer('action'),
        ' excitedly.',
      ),

      dialogue(
        'LARRY',
        'Tonight’s my night. After this performance, people are going to remember the name Larry Dallas.',
      ),

      dialogue(
        'JACK',
        'They already do. Usually right before they lock the ',
        answer('something-with-lock'),
        '.',
      ),

      stage(
        'JANET and CHRISSY arrive.',
      ),

      dialogue(
        'CHRISSY',
        'Look! They decorated the stage!',
      ),

      dialogue(
        'JANET',
        'With exactly three ',
        answer('another-plural-object'),
        '. They really spared no expense.',
      ),

      dialogue(
        'LARRY',
        'Laugh all you want. I’ve got an act nobody will ever forget.',
      ),

      dialogue(
        'JACK',
        'What is it?',
      ),

      dialogue(
        'LARRY',
        'If I told you now… it’d ruin the surprise.',
      ),

      dialogue(
        'JANET',
        'Or admit you don’t have one.',
      ),

      stage(
        'LARRY smiles confidently.',
      ),

      dialogue(
        'LARRY',
        'You’ll see.',
      ),

      stage(
        'MRS. ROPER enters carrying STANLEY by the arm.',
      ),

      dialogue(
        'MRS. ROPER',
        'There they are! I signed us both up!',
      ),

      dialogue(
        'MR. ROPER',
        'You signed you up. I was standing nearby.',
      ),

      dialogue(
        'MRS. ROPER',
        'Stanley has a ',
        answer('adjective'),
        ' hidden talent.',
      ),

      dialogue(
        'MR. ROPER',
        'Staying hidden.',
      ),

      stage(
        'The HOST rings a bell.',
      ),

      dialogue(
        'HOST',
        'First performer! Larry “The ',
        answer('honorific-title'),
        '” Dallas!',
      ),

      stage(
        'LARRY straightens his ',
        answer('article-of-clothing'),
        '.',
      ),

      dialogue(
        'LARRY',
        'Wish me luck.',
      ),

      stage(
        'He confidently walks onto the stage. The audience applauds politely. Long pause.',
      ),

      dialogue(
        'LARRY',
        'Thank you. Tonight… I’ll be demonstrating… perfect confidence.',
      ),

      stage(
        'Another pause. He smiles. Bows. Walks offstage. The audience sits in complete silence.',
      ),

      dialogue(
        'JACK',
        'That was your act?',
      ),

      dialogue(
        'LARRY',
        'People paid attention, didn’t they?',
      ),

      dialogue(
        'JANET',
        'Mostly because they were waiting for it to start.',
      ),

      stage(
        'The HOST rings the bell again.',
      ),

      dialogue(
        'HOST',
        'Jack Tripper!',
      ),

      dialogue(
        'JACK',
        'Showtime.',
      ),

      stage(
        'JACK walks onto the stage.',
      ),

      dialogue(
        'JACK',
        'Good evening. Tonight I’ll be performing something requiring ',
        answer('another-adjective'),
        ' skill… balance… and years of practice.',
      ),

      stage(
        'He dramatically flips a ',
        answer('bar-object'),
        ' into the air. Everyone watches. The ',
        answer('bar-object'),
        ' lands neatly in his hands. Applause.',
      ),

      stage(
        'JACK smiles. He tries it again. The ',
        answer('bar-object'),
        ' flies offstage. A loud crash is heard.',
      ),

      stage(
        'Offstage someone shouts, “',
        answer('exclamation'),
        '!”',
      ),

      stage(
        'Long silence.',
      ),

      dialogue(
        'JACK',
        'That second part usually isn’t included.',
      ),

      stage(
        'Laughter.',
      ),

      dialogue(
        'HOST',
        'Stanley and Helen Roper!',
      ),

      dialogue(
        'MRS. ROPER',
        'Come on, Stanley!',
      ),

      stage(
        'She practically drags him onto the stage.',
      ),

      dialogue(
        'MR. ROPER',
        'Folks… I don’t sing. I don’t dance. And after watching these two… I’m sure I don’t do whatever that was either.',
      ),

      stage(
        'The audience bursts into laughter and applause. STANLEY looks genuinely confused.',
      ),

      dialogue(
        'MR. ROPER',
        'I haven’t even started yet.',
      ),

      stage(
        'The applause gets louder. MRS. ROPER beams proudly.',
      ),

      dialogue(
        'MRS. ROPER',
        'See? I told you you were talented.',
      ),

      dialogue(
        'MR. ROPER',
        'Helen… They’re laughing before I do anything. I’m peaking early.',
      ),

      stage('Freeze Frame.'),
    ],
  },
]

export default lostScripts