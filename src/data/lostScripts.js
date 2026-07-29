const lostScripts = [
  {
    id: 'refrigerator-mystery',
    title: 'The Refrigerator Mystery',
    teaser:
      'Jack insists the creature in the refrigerator is perfectly normal.',
    archiveNumber: 'LS-201-01',
    prompts: [
      {
        id: 'animal',
        label: 'Animal',
        example: 'ostrich',
      },
      {
        id: 'occupation-one',
        label: 'Occupation',
        example: 'dentist',
      },
      {
        id: 'plural-noun-one',
        label: 'Plural noun',
        example: 'bowling balls',
      },
      {
        id: 'body-part',
        label: 'Body part',
        example: 'elbow',
      },
      {
  id: 'occupation-two',
  label: 'Another occupation',
  example: 'astronaut',
  mustComeAfter: 'occupation-one',
},
      {
        id: 'number',
        label: 'Number',
        example: '47',
      },
      {
        id: 'verb-ing',
        label: 'Verb ending in “-ing”',
        example: 'dancing',
      },
      {
        id: 'sound',
        label: 'Funny sound',
        example: 'squonk',
      },
      {
  id: 'plural-noun-two',
  label: 'Another plural noun',
  example: 'rubber chickens',
  mustComeAfter: 'plural-noun-one',
},
      {
        id: 'adjective',
        label: 'Adjective',
        example: 'suspicious',
      },
    ],
    blocks: [
      {
        type: 'scene-heading',
        text: 'INT. APARTMENT 201 – EVENING',
      },
      {
        type: 'stage-direction',
        parts: [
          'JANET stands in front of the open refrigerator, holding a pair of ',
          {
            answerId: 'plural-noun-one',
          },
          '. JACK enters carrying a grocery bag.',
        ],
      },
      {
        type: 'dialogue',
        speaker: 'JANET',
        parts: [
          'Jack, would you please explain why there is a ',
          {
            answerId: 'animal',
          },
          ' sitting on the second shelf?',
        ],
      },
      {
        type: 'dialogue',
        speaker: 'JACK',
        parts: [
          'That is not a ',
          {
            answerId: 'animal',
          },
          '. That is a very delicate ',
          {
            answerId: 'occupation-one',
          },
          '.',
        ],
      },
      {
        type: 'dialogue',
        speaker: 'JANET',
        text: 'It just blinked at me.',
      },
      {
        type: 'dialogue',
        speaker: 'JACK',
        text: 'That proves it is fresh.',
      },
      {
        type: 'stage-direction',
        parts: [
          'CHRISSY enters wearing a hat made from ',
          {
            answerId: 'plural-noun-two',
          },
          '.',
        ],
      },
      {
        type: 'dialogue',
        speaker: 'CHRISSY',
        parts: [
          'Has anybody seen my ',
          {
            answerId: 'body-part',
          },
          ' cream?',
        ],
      },
      {
        type: 'dialogue',
        speaker: 'JANET',
        text: 'Your what?',
      },
      {
        type: 'dialogue',
        speaker: 'CHRISSY',
        parts: [
          'The cream for my ',
          {
            answerId: 'body-part',
          },
          '. The bottle says it makes everything look younger.',
        ],
      },
      {
        type: 'dialogue',
        speaker: 'JACK',
        text: 'Then give some to the couch.',
      },
      {
        type: 'stage-direction',
        text: 'The front door opens. LARRY rushes in carrying a large covered tray.',
      },
      {
        type: 'dialogue',
        speaker: 'LARRY',
        parts: [
          'I need a favor. My date thinks I am a professional ',
          {
            answerId: 'occupation-two',
          },
          ', and she will be here in ',
          {
            answerId: 'number',
          },
          ' minutes.',
        ],
      },
      {
        type: 'dialogue',
        speaker: 'JANET',
        text: 'Why would she think that?',
      },
      {
        type: 'dialogue',
        speaker: 'LARRY',
        text: 'Because I told her.',
      },
      {
        type: 'dialogue',
        speaker: 'JACK',
        text: 'Solid foundation for a relationship.',
      },
      {
        type: 'stage-direction',
        parts: [
          'The refrigerator door slowly swings open. The ',
          {
            answerId: 'animal',
          },
          ' jumps onto Larry’s tray.',
        ],
      },
      {
        type: 'dialogue',
        speaker: 'LARRY',
        text: 'My dinner!',
      },
      {
        type: 'dialogue',
        speaker: 'CHRISSY',
        text: 'Maybe it was hungry.',
      },
      {
        type: 'dialogue',
        speaker: 'JANET',
        text: 'Why was your dinner covered in the first place?',
      },
      {
        type: 'dialogue',
        speaker: 'LARRY',
        parts: [
          'Because it was still ',
          {
            answerId: 'verb-ing',
          },
          '.',
        ],
      },
      {
        type: 'stage-direction',
        text: 'MR. ROPER enters without knocking.',
      },
      {
        type: 'dialogue',
        speaker: 'MR. ROPER',
        text: 'What is all this noise?',
      },
      {
        type: 'stage-direction',
        parts: [
          'Everyone freezes. The ',
          {
            answerId: 'animal',
          },
          ' lets out a loud ',
          {
            answerId: 'sound',
          },
          '.',
        ],
      },
      {
        type: 'dialogue',
        speaker: 'MR. ROPER',
        parts: [
          'Jack, I knew there was something ',
          {
            answerId: 'adjective',
          },
          ' going on in this apartment.',
        ],
      },
      {
        type: 'dialogue',
        speaker: 'JACK',
        text: 'Mr. Roper, I can explain.',
      },
      {
        type: 'dialogue',
        speaker: 'MR. ROPER',
        text: 'Good. Start with the hat.',
      },
      {
        type: 'stage-direction',
        text: 'CHRISSY smiles proudly.',
      },
      {
        type: 'dialogue',
        speaker: 'CHRISSY',
        parts: [
          'You like it? It is made from genuine ',
          {
            answerId: 'plural-noun-two',
          },
          '.',
        ],
      },
      {
        type: 'stage-direction',
        text: 'MR. ROPER removes his glasses, wipes them, and puts them back on.',
      },
      {
        type: 'dialogue',
        speaker: 'MR. ROPER',
        text: 'I liked this building better when all I had to worry about was the plumbing.',
      },
      {
        type: 'stage-direction',
        parts: [
          'The ',
          {
            answerId: 'animal',
          },
          ' steals Larry’s dinner and runs out the door.',
        ],
      },
      {
        type: 'dialogue',
        speaker: 'LARRY',
        text: 'There goes my date.',
      },
      {
        type: 'dialogue',
        speaker: 'JANET',
        text: 'That was your date?',
      },
      {
        type: 'dialogue',
        speaker: 'LARRY',
        text: 'At this point, it was my best option.',
      },
    ],
  },
]

export default lostScripts