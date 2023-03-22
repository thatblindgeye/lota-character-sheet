/** ASYNC HELPERS - https://github.com/onyxring/Roll20Async */
const async20 = (function () {
  'use strict';

  function setActiveCharacterId(charId) {
    const oldCharId = getActiveCharacterId();
    const customEvent = new CustomEvent('message');
    customEvent.data = { id: '0', type: 'setActiveCharacter', data: charId };
    self.dispatchEvent(customEvent);
    return oldCharId;
  }

  function getAttrsAsync(props) {
    const activeCharId = getActiveCharacterId();
    let prevActiveCharId = null;

    return new Promise((resolve, reject) => {
      prevActiveCharId = setActiveCharacterId(activeCharId);
      try {
        getAttrs(props, (values) => {
          resolve(values);
        });
      } catch {
        reject();
      }
    }).finally(() => {
      setActiveCharacterId(prevActiveCharId);
    });
  }

  function setAttrsAsync(propObj, options) {
    const activeCharId = getActiveCharacterId();
    let prevActiveCharId = null;
    return new Promise((resolve, reject) => {
      prevActiveCharId = setActiveCharacterId(activeCharId);
      try {
        setAttrs(
          _.mapObject(propObj, (propVal) => propVal.toString()),
          options,
          (values) => {
            resolve(values);
          }
        );
      } catch {
        reject();
      }
    }).finally(() => {
      setActiveCharacterId(prevActiveCharId);
    });
  }

  function getSectionIDsAsync(sectionName) {
    const activeCharId = getActiveCharacterId();
    let prevActiveCharId = null;
    return new Promise((resolve, reject) => {
      prevActiveCharId = setActiveCharacterId(activeCharId);
      try {
        getSectionIDs(sectionName, (values) => {
          resolve(values);
        });
      } catch {
        reject();
      }
    }).finally(() => {
      setActiveCharacterId(prevActiveCharId);
    });
  }
  function getSingleAttrAsync(prop) {
    const activeCharId = getActiveCharacterId();
    let prevActiveCharId = null;
    return new Promise((resolve, reject) => {
      prevActiveCharId = setActiveCharacterId(activeCharId);
      try {
        getAttrs([prop], (values) => {
          resolve(values[prop]);
        });
      } catch {
        reject();
      }
    }).finally(() => {
      setActiveCharacterId(prevActiveCharId);
    });
  }

  return {
    getAttrsAsync,
    setAttrsAsync,
    getSectionIDsAsync,
    getSingleAttrAsync,
  };
})();
/** END ASYNC HELPERS */

/** LOTA */
const lota = (function () {
  'use strict';
  const { getAttrsAsync, getSectionIDsAsync, setAttrsAsync } = async20;

  /* HELPER FUNCTIONS */
  function formatAttrKey(keyToFormat) {
    return keyToFormat.toLowerCase().replace(/\W+/g, '_');
  }

  function capitalize(textToCapitalize, firstLetterOnly = true) {
    if (firstLetterOnly) {
      return textToCapitalize[0].toUpperCase() + textToCapitalize.slice(1);
    }

    return _.map(
      textToCapitalize.split(' '),
      (word) => word[0].toUpperCase() + word.slice(1)
    ).join(' ');
  }

  function sortIgnoringCase(arrayToSort, property) {
    const arrayCopy = JSON.parse(JSON.stringify(arrayToSort));

    return arrayCopy.sort((toSortA, toSortB) => {
      const itemOne = property ? toSortA[property] : toSortA;
      const itemTwo = property ? toSortB[property] : toSortB;

      return itemOne.localeCompare(itemTwo, undefined, {
        sensitivity: 'base',
        numeric: true,
      });
    });
  }

  async function getOrderedRowIds(repeatingSection) {
    const attrValues = await getAttrsAsync([
      `_reporder_repeating_${repeatingSection}`,
    ]);
    const reporderArray = attrValues[`_reporder_repeating_${repeatingSection}`]
      ? attrValues[`_reporder_repeating_${repeatingSection}`]
          .toLowerCase()
          .split(',')
      : [];
    const sectionIds = await getSectionIDsAsync(repeatingSection);

    return _.uniq(
      reporderArray.filter((id) => sectionIds.includes(id)).concat(sectionIds)
    );
  }

  function removeInvalidRow(rowArray, regexTest, sectionName, rowIdArray) {
    const invalidIndex = rowArray.findIndex((item) => regexTest.test(item));

    if (invalidIndex > -1) {
      removeRepeatingRow(
        `repeating_${sectionName}_${rowIdArray[invalidIndex]}`
      );
      return rowArray.filter((_item, index) => index !== invalidIndex);
    }

    return rowArray;
  }

  function registerEventHandlers() {
    $20('.lota-sheet-tablist__tab').on('click', function (eventInfo) {
      const newTab = eventInfo.htmlAttributes['data-tab'];
      $20('.lota-sheet-tablist__tab').removeClass('lota-is-selected');
      $20('.lota-sheet-tablist__panel').removeClass('lota-is-selected');
      $20(`.lota-sheet-tablist__tab[data-tab=${newTab}]`).addClass(
        'lota-is-selected'
      );
      $20(`.lota-sheet-tablist__panel[data-tab=${newTab}]`).addClass(
        'lota-is-selected'
      );
    });
  }

  return { registerEventHandlers };
})();

lota.registerEventHandlers();
