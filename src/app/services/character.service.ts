import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Bag } from '~enums';
import { Character } from '~models';

// eslint-disable-next-line no-restricted-imports
import DefaultCharacter from '../../assets/default_character.json';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  $character: BehaviorSubject<Character> = new BehaviorSubject(null);
  $index: BehaviorSubject<number> = new BehaviorSubject(null);
  $bag: BehaviorSubject<Bag> = new BehaviorSubject(null);

  constructor() {
    const defaultCharacter = DefaultCharacter as unknown as Character;
    defaultCharacter.characterGuid = crypto.randomUUID().replace(/-/g, '');
    this.setCharacter(defaultCharacter, 0);
  }

  /**
   * Set the current Character which the application will edit and the index how the file was encrypted
   */
  setCharacter(character: Character, index: number): void {
    this.$character.next(character);
    this.$index.next(index);
    const objectID = character.inventory[58].objectID;
    const bag = objectID in Bag ? objectID : Bag.None;
    this.$bag.next(bag);

    // Skill are added later to the file, when earned the first xp
    // Create them if they dont exist
    for (let i = 0; i < 9; i++) {
      const skill = character.skills.find(skill => skill.skillID === i);
      if (skill == null) {
        character.skills.push({ skillID: i, value: 0 });
        character.skillTalentTreeDatas.push({
          skillTreeID: i,
          points: [0, 0, 0, 0, 0, 0, 0]
        });
      } else {
        const skillTree = character.skillTalentTreeDatas.find(talent => talent.skillTreeID === i);
        // If nothing was skilled, the skillTree is not initialized so we create one
        if (skillTree == null) {
          character.skillTalentTreeDatas.push({
            skillTreeID: i,
            points: [0, 0, 0, 0, 0, 0, 0]
          });
        } else {
          // If you only level up the first talent, the other ones are not created, fill them up
          for (let i = skillTree.points.length; i < 7; i++) {
            skillTree.points[i] = 0;
          }
        }
      }
    }

    // And afterwards sort them so it looks like the game ui when rendering them in a loop
    character.skills.sort((a, b) => a.skillID - b.skillID);
    character.skillTalentTreeDatas.sort((a, b) => a.skillTreeID - b.skillTreeID);
    console.log(character);
  }
}
