export type Choice = {
  id: string;
  label: string;
  consequence: string;
  explanation: string;
  health: number;
  energy: number;
  supplies: number;
};

export type ScenarioRound = {
  title: string;
  setup: string;
  choices: Choice[];
};

export type GamePack = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  scenarioName: string;
  rounds: ScenarioRound[];
};

export const gamePacks: GamePack[] = [
  {
    id: "history",
    name: "Could You Survive History?",
    emoji: "🏛️",
    description: "Make decisions inside real historical events and learn why they mattered.",
    scenarioName: "Pompeii — 79 AD",
    rounds: [
      {
        title: "The Ground Won't Stop Shaking",
        setup:
          "Small earthquakes have been happening for days. This morning, the tremors are stronger and people in the city are getting nervous.",
        choices: [
          {
            id: "leave",
            label: "Leave the city early",
            consequence: "You move away from the most dangerous zone before conditions worsen.",
            explanation:
              "Pompeii experienced earthquakes before the eruption. Leaving early would have reduced exposure to later ashfall and pyroclastic flows.",
            health: 1,
            energy: -1,
            supplies: 0
          },
          {
            id: "wait",
            label: "Stay and wait for more information",
            consequence: "You save energy, but lose valuable evacuation time.",
            explanation:
              "Waiting for certainty is risky during rapidly escalating disasters. Historical residents had limited warning systems compared with today.",
            health: -1,
            energy: 1,
            supplies: 0
          },
          {
            id: "harbor",
            label: "Head toward the harbor",
            consequence: "You move toward a possible escape route, but the coast may become difficult to use.",
            explanation:
              "Sea evacuation can help in some disasters, but volcanic ash, rough water, and visibility can make harbors unreliable.",
            health: 0,
            energy: -1,
            supplies: 1
          }
        ]
      },
      {
        title: "Ash Starts Falling",
        setup:
          "Ash and pumice are now falling from the sky. Roofs are beginning to collect heavy debris.",
        choices: [
          {
            id: "roof",
            label: "Stay inside under a roof",
            consequence: "You avoid falling debris outside, but the roof becomes a new danger.",
            explanation:
              "Heavy volcanic deposits can overload roofs. Shelter can help briefly, but remaining under a collapsing structure is dangerous.",
            health: -1,
            energy: 1,
            supplies: 0
          },
          {
            id: "cover",
            label: "Cover your face and move out",
            consequence: "You protect your breathing and keep moving away from the city.",
            explanation:
              "Covering the nose and mouth can reduce inhalation of ash particles while evacuating.",
            health: 1,
            energy: -1,
            supplies: 0
          },
          {
            id: "collect",
            label: "Stop to gather valuables",
            consequence: "You gain supplies, but lose precious time.",
            explanation:
              "In emergencies, delaying evacuation to collect property can increase exposure to rapidly changing hazards.",
            health: -1,
            energy: -1,
            supplies: 2
          }
        ]
      },
      {
        title: "The Sky Turns Dark",
        setup:
          "Daylight fades under the ash cloud. Visibility is poor, breathing is harder, and people are panicking.",
        choices: [
          {
            id: "road",
            label: "Follow the main road out",
            consequence: "You use a known route and maintain direction.",
            explanation:
              "Known evacuation routes reduce the chance of becoming disoriented when visibility is poor.",
            health: 1,
            energy: -1,
            supplies: 0
          },
          {
            id: "shortcut",
            label: "Take an unfamiliar shortcut",
            consequence: "You save distance if it works, but risk getting trapped or lost.",
            explanation:
              "In low visibility, unfamiliar routes can create extra risk because landmarks disappear and hazards are harder to see.",
            health: -1,
            energy: 0,
            supplies: 0
          },
          {
            id: "hide",
            label: "Hide and wait for the ash to stop",
            consequence: "You conserve energy but remain close to the eruption.",
            explanation:
              "The eruption did not end quickly. Waiting close to Vesuvius exposed people to later, more dangerous phases.",
            health: -2,
            energy: 1,
            supplies: 0
          }
        ]
      }
    ]
  },

  {
    id: "money",
    name: "Money Moves",
    emoji: "💸",
    description: "Survive real-life money decisions without getting wrecked by bad choices.",
    scenarioName: "Your First Month Living Alone",
    rounds: [
      {
        title: "Payday Hits",
        setup:
          "You receive $2,400 after tax. Rent is $1,200, utilities are about $180, groceries are $300, and you have $900 in savings.",
        choices: [
          {
            id: "budget",
            label: "Pay essentials first and set spending limits",
            consequence: "You keep your month stable and protect your savings.",
            explanation:
              "Prioritizing fixed needs before discretionary spending helps prevent cash-flow problems.",
            health: 1,
            energy: 0,
            supplies: 2
          },
          {
            id: "splurge",
            label: "Spend $500 celebrating first",
            consequence: "You have fun now, but your margin for emergencies shrinks.",
            explanation:
              "Large discretionary spending before covering essential costs can create avoidable shortfalls later in the month.",
            health: 0,
            energy: 1,
            supplies: -2
          },
          {
            id: "saveall",
            label: "Move almost everything to savings immediately",
            consequence: "You save aggressively but create a cash-flow squeeze.",
            explanation:
              "Saving is important, but a realistic budget needs enough liquid cash for expected bills and everyday expenses.",
            health: 0,
            energy: -1,
            supplies: 1
          }
        ]
      },
      {
        title: "The Car Repair",
        setup:
          "Your car suddenly needs a $650 repair. You need it for work.",
        choices: [
          {
            id: "emergency",
            label: "Use emergency savings",
            consequence: "Your savings drop, but you avoid expensive debt.",
            explanation:
              "Emergency funds are designed for necessary, unexpected expenses like urgent transportation repairs.",
            health: 1,
            energy: 0,
            supplies: -1
          },
          {
            id: "paydayloan",
            label: "Use a high-cost payday loan",
            consequence: "You fix the car immediately, but create expensive debt.",
            explanation:
              "Payday loans often carry very high effective interest rates and can trigger repeated borrowing.",
            health: -1,
            energy: -1,
            supplies: -2
          },
          {
            id: "credit",
            label: "Put it on a credit card and make a payoff plan",
            consequence: "You preserve cash but must manage interest carefully.",
            explanation:
              "Credit can bridge an emergency, but it is safer when paired with a clear, short repayment plan.",
            health: 0,
            energy: -1,
            supplies: 0
          }
        ]
      },
      {
        title: "The Subscription Trap",
        setup:
          "You discover six subscriptions totaling $92 per month. You barely use four of them.",
        choices: [
          {
            id: "cancel",
            label: "Cancel the ones you do not use",
            consequence: "You free up money every month.",
            explanation:
              "Recurring expenses are easy to overlook. Reviewing subscriptions regularly can improve monthly cash flow.",
            health: 1,
            energy: 0,
            supplies: 2
          },
          {
            id: "ignore",
            label: "Ignore them because each one is small",
            consequence: "Nothing changes, but the annual cost keeps growing.",
            explanation:
              "$92 per month is $1,104 per year. Small recurring expenses can become significant in aggregate.",
            health: 0,
            energy: 0,
            supplies: -1
          },
          {
            id: "cancelall",
            label: "Cancel everything immediately",
            consequence: "You save the most, but also remove services you actually use.",
            explanation:
              "The goal is not always to eliminate spending; it is to align spending with actual value and priorities.",
            health: 0,
            energy: -1,
            supplies: 1
          }
        ]
      }
    ]
  },

  {
    id: "science",
    name: "Science Survival",
    emoji: "🔬",
    description: "Use science, logic, and engineering to survive escalating problems.",
    scenarioName: "Stranded on Mars",
    rounds: [
      {
        title: "Oxygen Is Dropping",
        setup:
          "Your habitat's oxygen system is losing efficiency and you have limited power.",
        choices: [
          {
            id: "seal",
            label: "Check for leaks and seal the habitat",
            consequence: "You reduce oxygen loss before spending more power.",
            explanation:
              "Stopping leakage addresses the source of the problem before increasing oxygen production.",
            health: 1,
            energy: 0,
            supplies: 0
          },
          {
            id: "boost",
            label: "Increase oxygen production immediately",
            consequence: "Oxygen rises briefly, but power drains faster.",
            explanation:
              "Increasing output can help short-term, but it does not solve a leak and may waste limited energy.",
            health: 0,
            energy: -2,
            supplies: 0
          },
          {
            id: "ignore",
            label: "Wait to see if the reading stabilizes",
            consequence: "You conserve power but lose critical time.",
            explanation:
              "When life-support readings deteriorate consistently, delaying diagnosis can increase risk.",
            health: -2,
            energy: 1,
            supplies: 0
          }
        ]
      },
      {
        title: "The Water Recycler Fails",
        setup:
          "Your water recycler stops working. You have three days of stored drinking water.",
        choices: [
          {
            id: "repair",
            label: "Repair the recycler immediately",
            consequence: "You spend energy and parts but restore the system.",
            explanation:
              "Closed-loop recycling is essential when resupply is impossible because stored water is finite.",
            health: 1,
            energy: -1,
            supplies: -1
          },
          {
            id: "ration",
            label: "Ration stored water and delay repairs",
            consequence: "You conserve parts but reduce your safety margin.",
            explanation:
              "Rationing helps temporarily, but dehydration risk rises if the underlying system remains broken.",
            health: -1,
            energy: 0,
            supplies: 1
          },
          {
            id: "experiment",
            label: "Try an untested chemical purification method",
            consequence: "You may conserve resources, but introduce contamination risk.",
            explanation:
              "Emergency purification methods must account for contaminants and safe concentration levels.",
            health: -2,
            energy: -1,
            supplies: 1
          }
        ]
      },
      {
        title: "Dust Storm Incoming",
        setup:
          "A major dust storm is approaching and your solar output is already falling.",
        choices: [
          {
            id: "powerdown",
            label: "Shut down nonessential systems",
            consequence: "You preserve battery capacity for life support.",
            explanation:
              "Load shedding protects limited stored energy when generation is temporarily reduced.",
            health: 1,
            energy: 1,
            supplies: 0
          },
          {
            id: "normal",
            label: "Keep everything running normally",
            consequence: "Life stays comfortable briefly, but battery reserves drop fast.",
            explanation:
              "When incoming power falls, maintaining full consumption can deplete batteries before generation recovers.",
            health: -1,
            energy: -2,
            supplies: 0
          },
          {
            id: "outside",
            label: "Go outside to clean the panels",
            consequence: "You increase output if successful but expose yourself to the storm.",
            explanation:
              "Maintenance can improve solar performance, but human safety must be weighed against the energy benefit.",
            health: -2,
            energy: -1,
            supplies: 2
          }
        ]
      }
    ]
  },

  {
    id: "chaos",
    name: "Chaos Mode",
    emoji: "🔥",
    description: "Pure party-game energy: ridiculous scenarios, betrayal, and bad decisions.",
    scenarioName: "Trapped in IKEA Overnight",
    rounds: [
      {
        title: "The Doors Lock",
        setup:
          "The store closes, the lights dim, and somehow your group is still inside.",
        choices: [
          {
            id: "beds",
            label: "Claim the best display bed",
            consequence: "You sleep comfortably but immediately make enemies.",
            explanation:
              "There is no educational lesson here. You just chose violence.",
            health: 1,
            energy: 2,
            supplies: 0
          },
          {
            id: "foodcourt",
            label: "Raid the food court",
            consequence: "You secure snacks before everybody else realizes what is happening.",
            explanation:
              "Strategically, food is useful. Socially, your friends will remember this.",
            health: 0,
            energy: 1,
            supplies: 2
          },
          {
            id: "explore",
            label: "Explore the warehouse alone",
            consequence: "You find useful supplies but hear something terrifying behind aisle 42.",
            explanation:
              "Congratulations. You have voluntarily entered the horror-movie section of the game.",
            health: -1,
            energy: -1,
            supplies: 2
          }
        ]
      },
      {
        title: "The Meatball Crisis",
        setup:
          "There are only four servings of meatballs left for six people.",
        choices: [
          {
            id: "share",
            label: "Split them evenly",
            consequence: "Nobody gets enough, but the group stays peaceful.",
            explanation:
              "Cooperation lowers conflict even when resources remain scarce.",
            health: 0,
            energy: 1,
            supplies: 0
          },
          {
            id: "take",
            label: "Take a full serving immediately",
            consequence: "You eat well. Everybody notices.",
            explanation:
              "Short-term gain. Long-term group-chat consequences.",
            health: 1,
            energy: 1,
            supplies: 0
          },
          {
            id: "trade",
            label: "Trade your flashlight for food",
            consequence: "You eat, but now you are walking around IKEA in the dark.",
            explanation:
              "Every resource has an opportunity cost — even during nonsense.",
            health: 0,
            energy: 1,
            supplies: -1
          }
        ]
      },
      {
        title: "The Forklift Incident",
        setup:
          "Someone finds the keys to a forklift. Nobody in the group is qualified to drive it.",
        choices: [
          {
            id: "nope",
            label: "Absolutely do not touch it",
            consequence: "You remain boring and alive.",
            explanation:
              "Correct use of heavy equipment requires training. This is the unexpectedly responsible option.",
            health: 1,
            energy: 0,
            supplies: 0
          },
          {
            id: "drive",
            label: "Drive it anyway",
            consequence: "This goes about as well as expected.",
            explanation:
              "Confidence is not certification.",
            health: -2,
            energy: -1,
            supplies: 1
          },
          {
            id: "hidekeys",
            label: "Hide the keys from everyone",
            consequence: "You prevent disaster but are accused of ruining the fun.",
            explanation:
              "Risk management is often unpopular right up until something goes wrong.",
            health: 1,
            energy: 0,
            supplies: 0
          }
        ]
      }
    ]
  }
];

export function getPack(id: string) {
  return gamePacks.find((pack) => pack.id === id) ?? gamePacks[0];
}
