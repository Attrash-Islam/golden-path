import GoldenPathUpdater from '.';

describe('GoldenPathUpdater', () => {
    it('should update one level path when exist', () => {
        const object = { islam: 1 };
        const result = GoldenPathUpdater('islam', 4, object);
        expect(result).toEqual({ islam: 4 });
    });

    it('should update one level path when exist when function is being passed', () => {
        const object = { islam: 1 };
        const result = GoldenPathUpdater('islam', (x) => x + 1, object);
        expect(result).toEqual({ islam: 2 });
    });

    it('should create one level path when not exist', () => {
        const object = { sabel: 2 };
        const result = GoldenPathUpdater('islam', 4, object);
        expect(result).toEqual({ islam: 4, sabel: 2 });
    });

    it('should create one level path when not exist when function is being passed', () => {
        const object = { sabel: 2 };
        const result = GoldenPathUpdater('islam', (x) => `islam_${x}`, object);
        expect(result).toEqual({ islam: 'islam_undefined', sabel: 2 });
    });

    it('should override the whole object when path is empty', () => {
        const object = { islam: 1 };
        const result = GoldenPathUpdater('', 4, object);
        expect(result).toEqual(4);
    });

    it('should override the whole object when path is empty when function is being passed', () => {
        const object = { islam: 1 };
        const result = GoldenPathUpdater(() => '', 4, object);
        expect(result).toEqual(4);
    });

    it('should update array items when exist', () => {
        const object = { friends: [2] };
        const result = GoldenPathUpdater('friends.0', 3, object);
        expect(result).toEqual({ friends: [3] });
    });

    it('should push to array items when updating the array length', () => {
        const object = { friends: [2] };
        const result = GoldenPathUpdater(`friends.${object.friends.length}`, 3, object);
        expect(result).toEqual({ friends: [2, 3] });
    });

    it('should update array items when exist when function is being passed', () => {
        const object = { friends: [2] };
        const result = GoldenPathUpdater('friends.0', (x) => x - 1, object);
        expect(result).toEqual({ friends: [1] });
    });

    it('should update nested path in object when exist', () => {
        const object = { islam: { is: { nested: false } } };
        const result = GoldenPathUpdater('islam.is.nested', true, object);
        expect(result).toEqual({ islam: { is: { nested: true } } });
    });

    it('should update nested path in object when exist when function is being passed', () => {
        const object = { islam: { is: { nested: false } } };
        const result = GoldenPathUpdater('islam.is.nested', (x) => !x, object);
        expect(result).toEqual({ islam: { is: { nested: true } } });
    });

    it('should create nested path in object when not exist', () => {
        const object = { sabel: 'wife' };
        const result = GoldenPathUpdater('islam.is.exist.now', true, object);
        expect(result).toEqual({ sabel: 'wife', islam: { is: { exist: { now: true } } } });
    });

    it('should create nested path in object when not exist when function is being passed', () => {
        const object = { sabel: 'wife' };
        const result = GoldenPathUpdater('islam.is.exist.now', (x) => `${x}`, object);
        expect(result).toEqual({ sabel: 'wife', islam: { is: { exist: { now: 'undefined' } } } });
    });

    it('should update the property path in nested array of objects', () => {
        const object = { peoples: [{ id: 1 } ] };
        const result = GoldenPathUpdater(`peoples.${0}.id`, 3, object);
        expect(result).toEqual({ peoples: [{ id: 3 }] });
    });

    it('should update the property path in nested array of objects when function in passed', () => {
        const object = { peoples: [{ id: 1 } ] };
        const result = GoldenPathUpdater(`peoples.${0}.id`, (id) => id + 1, object);
        expect(result).toEqual({ peoples: [{ id: 2 }] });
    });

    describe('Conditional Updates For Arrays', () => {
        it('should update array in equal conditions', () => {
            const object = { peoples: [{ id: 1 } ] };
            const result = GoldenPathUpdater(`peoples[id=1]`, { id: 10, name: 'islam' }, object);
            expect(result).toEqual({ peoples: [{ id: 10, name: 'islam' }] });
        });

        it('should update array deep property in equal conditions', () => {
            const object = { peoples: [{ id: 1, name: 'islam' } ] };
            const result = GoldenPathUpdater(`peoples[id=1].name`, 'sabel', object);
            expect(result).toEqual({ peoples: [{ id: 1, name: 'sabel' }] });
        });

        it('should update array deep property in equal conditions', () => {
            const object = { peoples: [{ id: 1, name: 'islam' } ] };
            const result = GoldenPathUpdater(`peoples[id=1].name`, 'sabel', object);
            expect(result).toEqual({ peoples: [{ id: 1, name: 'sabel' }] });
        });

        it('should update array deep deep property in equal conditions', () => {
            const object = { peoples: [{ name: 'islam', friends: [{ sex: 'male', name: 'max' }, { sex: 'male', name: 'Aseel' }, { sex: 'female', name: 'sabel' } ] } ] };
            const result = GoldenPathUpdater(`peoples[name='islam'].friends[sex='male'].name`, 'Sohaib', object);
            expect(result).toEqual({ peoples: [{ name: 'islam', friends: [{ sex: 'male', name: 'Sohaib' }, {sex: 'male', name: 'Aseel' }, { sex: 'female', name: 'sabel' } ] } ] });
        });
    });
});
