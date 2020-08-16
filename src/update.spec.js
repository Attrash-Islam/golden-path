import { update, v } from '.';

describe('update', () => {
    it('should update one level path when exist', () => {
        const object = { islam: 1 };
        const result = update('islam', 4, object);
        expect(result).toEqual({ islam: 4 });
    });

    it('should update one level path when exist when function is being passed', () => {
        const object = { islam: 1 };
        const result = update('islam', (x) => x + 1, object);
        expect(result).toEqual({ islam: 2 });
    });

    it('should create one level path when not exist', () => {
        const object = { sabel: 2 };
        const result = update('islam', 4, object);
        expect(result).toEqual({ islam: 4, sabel: 2 });
    });

    it('should create one level path when not exist when function is being passed', () => {
        const object = { sabel: 2 };
        const result = update('islam', (x) => `islam_${x}`, object);
        expect(result).toEqual({ islam: 'islam_undefined', sabel: 2 });
    });

    it('should override the whole object when path is empty', () => {
        const object = { islam: 1 };
        const result = update('', 4, object);
        expect(result).toEqual(4);
    });

    it('should override the whole object when path is empty when function is being passed', () => {
        const object = { islam: 1 };
        const result = update(() => '', 4, object);
        expect(result).toEqual(4);
    });

    it('should update array items when exist', () => {
        const object = { friends: [2] };
        const result = update('friends.0', 3, object);
        expect(result).toEqual({ friends: [3] });
    });

    it('should push to array items when updating the array length', () => {
        const object = { friends: [2] };
        const result = update(`friends.${object.friends.length}`, 3, object);
        expect(result).toEqual({ friends: [2, 3] });
    });

    it('should update array items when exist when function is being passed', () => {
        const object = { friends: [2] };
        const result = update('friends.0', (x) => x - 1, object);
        expect(result).toEqual({ friends: [1] });
    });

    it('should update nested path in object when exist', () => {
        const object = { islam: { is: { nested: false } } };
        const result = update('islam.is.nested', true, object);
        expect(result).toEqual({ islam: { is: { nested: true } } });
    });

    it('should update nested path in object when exist when function is being passed', () => {
        const object = { islam: { is: { nested: false } } };
        const result = update('islam.is.nested', (x) => !x, object);
        expect(result).toEqual({ islam: { is: { nested: true } } });
    });

    it('should create nested path in object when not exist', () => {
        const object = { sabel: 'wife' };
        const result = update('islam.is.exist.now', true, object);
        expect(result).toEqual({ sabel: 'wife', islam: { is: { exist: { now: true } } } });
    });

    it('should create nested path in object when not exist when function is being passed', () => {
        const object = { sabel: 'wife' };
        const result = update('islam.is.exist.now', (x) => `${x}`, object);
        expect(result).toEqual({ sabel: 'wife', islam: { is: { exist: { now: 'undefined' } } } });
    });

    it('should update the property path in nested array of objects', () => {
        const object = { peoples: [{ id: 1 } ] };
        const result = update(`peoples.${0}.id`, 3, object);
        expect(result).toEqual({ peoples: [{ id: 3 }] });
    });

    it('should update the property path in nested array of objects when function in passed', () => {
        const object = { peoples: [{ id: 1 } ] };
        const result = update(`peoples.${0}.id`, (id) => id + 1, object);
        expect(result).toEqual({ peoples: [{ id: 2 }] });
    });

    describe('Conditional Updates For Arrays', () => {
        describe('Equals Symbol', () => {
            it('should update array when conditions satisfied', () => {
                const object = { peoples: [{ id: 1 }, { id: 5 } ] };
                const result = update(`peoples[id=1]`, { id: 10, name: 'islam' }, object);
                expect(result).toEqual({ peoples: [{ id: 10, name: 'islam' }, { id: 5 }] });
            });

            it('should update array when conditions satisfied when value is hashed', () => {
                const object = { peoples: [{ id: 1 }, { id: 5 } ] };
                const result = update(`peoples[id=${v(1)}]`, { id: 10, name: 'islam' }, object);
                expect(result).toEqual({ peoples: [{ id: 10, name: 'islam' }, { id: 5 }] });
            });

            it('should update first existence when conditions satisfied for singular queries', () => {
                const object = { peoples: [{ id: 1 }, { id: 1, other: true }] };
                const result = update(`peoples[id=1]`, { id: 10, name: 'islam' }, object);
                expect(result).toEqual({ peoples: [{ id: 10, name: 'islam' }, { id: 1, other: true }] });
            });

            it('should update relevant existence when multiple conditions are used', () => {
                const object = { peoples: [{ id: 1, other: false }, { id: 1, other: true }] };
                const result = update(`peoples[id=1][other=true]`, { id: 10, name: 'islam' }, object);
                expect(result).toEqual({ peoples: [{ id: 1, other: false }, { id: 10, name: 'islam' }] });
            });

            it('should update relevant existence when multiple conditions are used with complex string value', () => {
                const complexString = '[]&%.';
                const object = { peoples: [{ id: 1, other: false }, { id: 1, other: complexString }] };
                const result = update(`peoples[id=1][other=${v(complexString)}]`, { id: 10, name: 'islam' }, object);
                expect(result).toEqual({ peoples: [{ id: 1, other: false }, { id: 10, name: 'islam' }] });
            });

            it('should update relevant existence when multiple conditions are used with complex string key', () => {
                const complexString = '[]&%.';
                const object = { peoples: [{ id: 1, other: false }, { id: 1, [complexString]: 1 }] };
                const result = update(`peoples[id=1][${v(complexString)}=1]`, { id: 10, name: 'islam' }, object);
                expect(result).toEqual({ peoples: [{ id: 1, other: false }, { id: 10, name: 'islam' }] });
            });

            it('should update second item when first item type is not identical when conditions satisfied', () => {
                const object = { peoples: [{ id: '1' }, { id: 1 }] };
                const result = update(`peoples[id=1]`, { id: 10, name: 'islam' }, object);
                expect(result).toEqual({ peoples: [{ id: '1' }, { id: 10, name: 'islam' }] });
            });

            it('should not update array when condition do not match', () => {
                const object = { peoples: [{ id: 1 }, { id: 3 } ] };
                const result = update(`peoples[id=2]`, { id: 10, name: 'islam' }, object);
                expect(result).toEqual({ peoples: [{ id: 1 }, { id: 3 } ] });
            });
    
            it('should update array deep property when conditions satisfied', () => {
                const object = { peoples: [{ id: 1, name: 'islam' }, { id: 10, name: 'sabel' }] };
                const result = update(`peoples[id=1].name`, 'sabel', object);
                expect(result).toEqual({ peoples: [{ id: 1, name: 'sabel' }, { id: 10, name: 'sabel' }] });
            });
    
            it('should update array deep deep property when conditions satisfied', () => {
                const object = { peoples: [{ name: 'islam', friends: [{ sex: 'male', name: 'max' }, { sex: 'male', name: 'Aseel' }, { sex: 'female', name: 'sabel' } ] } ] };
                const result = update(`peoples[name=islam].friends[sex=male].name`, 'Sohaib', object);
                expect(result).toEqual({ peoples: [{ name: 'islam', friends: [{ sex: 'male', name: 'Sohaib' }, { sex: 'male', name: 'Aseel' }, { sex: 'female', name: 'sabel' } ] } ] });
            });
        });

        describe('NotEquals Symbol', () => {
            it('should update array when conditions satisfied', () => {
                const object = { peoples: [{ id: 2 }, { id: 3 } ] };
                const result = update(`peoples[id!=1]`, { id: 3, name: 'michael' }, object);
                expect(result).toEqual({ peoples: [{ id: 3, name: 'michael' }, { id: 3 }] });
            });

            it('should update array when conditions satisfied when value is hashed', () => {
                const object = { peoples: [{ id: 2 }, { id: 3 } ] };
                const result = update(`peoples[id!=${v(1)}]`, { id: 3, name: 'michael' }, object);
                expect(result).toEqual({ peoples: [{ id: 3, name: 'michael' }, { id: 3 }] });
            });

            it('should update first existence when conditions satisfied for singular queries', () => {
                const object = { peoples: [{ id: 2 }, { id: 2, other: true }] };
                const result = update(`peoples[id!=1]`, { id: 100, name: 'john' }, object);
                expect(result).toEqual({ peoples: [{ id: 100, name: 'john' }, { id: 2, other: true }] });
            });

            it('should update relevant item when type is not identical when conditions satisfied', () => {
                const object = { peoples: [{ id: '2' }, { id: '3' }] };
                const result = update(`peoples[id!=2]`, { id: 10, name: 'islam' }, object);
                expect(result).toEqual({ peoples: [{ id: 10, name: 'islam' }, { id: '3' }] });
            });
    
            it('should not update array when condition do not match', () => {
                const object = { peoples: [{ id: 1 } ] };
                const result = update(`peoples[id!=1]`, { id: 10, name: 'islam' }, object);
                expect(result).toEqual({ peoples: [{ id: 1 } ] });
            });
    
            it('should update array deep property when conditions satisfied', () => {
                const object = { peoples: [{ id: 2, name: 'islam' }, { id: 3, name: 'xx' } ] };
                const result = update(`peoples[id!=1].name`, 'sabel', object);
                expect(result).toEqual({ peoples: [{ id: 2, name: 'sabel' }, { id: 3, name: 'xx' }] });
            });
    
            it('should update array deep deep property when conditions satisfied', () => {
                const object = { peoples: [{ name: 'islam', friends: [{ sex: 'male', name: 'max' }, { sex: 'male', name: 'Aseel' }, { sex: 'female', name: 'sabel' } ] } ] };
                const result = update(`peoples[name!=john].friends[sex!=female].name`, 'Sohaib', object);
                expect(result).toEqual({ peoples: [{ name: 'islam', friends: [{ sex: 'male', name: 'Sohaib' }, { sex: 'male', name: 'Aseel' }, { sex: 'female', name: 'sabel' } ] } ] });
            });
        });

        describe('BiggerThan Symbol', () => {
            it('should update array when conditions satisfied', () => {
                const object = { peoples: [{ id: 2 } ] };
                const result = update(`peoples[id>1]`, { id: 3, name: 'michael' }, object);
                expect(result).toEqual({ peoples: [{ id: 3, name: 'michael' }] });
            });

            it('should update array when conditions satisfied when value is hashed', () => {
                const object = { peoples: [{ id: 2 } ] };
                const result = update(`peoples[id>${v(1)}]`, { id: 3, name: 'michael' }, object);
                expect(result).toEqual({ peoples: [{ id: 3, name: 'michael' }] });
            });

            it('should update first existence when conditions satisfied for singular queries', () => {
                const object = { peoples: [{ id: 2 }, { id: 2, other: true }] };
                const result = update(`peoples[id>1]`, { id: 100, name: 'john' }, object);
                expect(result).toEqual({ peoples: [{ id: 100, name: 'john' }, { id: 2, other: true }] });
            });

            it('should not update array when condition do not match', () => {
                const object = { peoples: [{ id: 1 } ] };
                const result = update(`peoples[age>30]`, { id: 10, name: 'islam' }, object);
                expect(result).toEqual({ peoples: [{ id: 1 } ] });
            });

            it('should update array deep property when conditions satisfied', () => {
                const object = { peoples: [{ id: 2, name: 'islam' }, { id: 3, name: 'xx' } ] };
                const result = update(`peoples[id>1].name`, 'sabel', object);
                expect(result).toEqual({ peoples: [{ id: 2, name: 'sabel' }, { id: 3, name: 'xx' }] });
            });
    
            it('should update array deep deep property when conditions satisfied', () => {
                const object = { peoples: [{ name: 'islam', friends: [{ age: 20, name: 'max' }, { age: 30, name: 'Aseel' }, { age: 40, name: 'sabel' } ] } ] };
                const result = update(`peoples[name=islam].friends[age>29].name`, 'Sohaib', object);
                expect(result).toEqual({ peoples: [{ name: 'islam', friends: [{ age: 20, name: 'max' }, { age: 30, name: 'Sohaib' }, { age: 40, name: 'sabel' } ] } ] });
            });
        });

        describe('BiggerThanEquals Symbol', () => {
            it('should update array when conditions satisfied', () => {
                const object = { peoples: [{ id: 2 } ] };
                const result = update(`peoples[id>=1]`, { id: 3, name: 'michael' }, object);
                expect(result).toEqual({ peoples: [{ id: 3, name: 'michael' }] });
            });

            it('should update array when conditions satisfied when value is hashed', () => {
                const object = { peoples: [{ id: 2 } ] };
                const result = update(`peoples[id>=${v(1)}]`, { id: 3, name: 'michael' }, object);
                expect(result).toEqual({ peoples: [{ id: 3, name: 'michael' }] });
            });

            it('should update first existence when conditions satisfied for singular queries', () => {
                const object = { peoples: [{ id: 2 }, { id: 2, other: true }] };
                const result = update(`peoples[id>=2]`, { id: 100, name: 'john' }, object);
                expect(result).toEqual({ peoples: [{ id: 100, name: 'john' }, { id: 2, other: true }] });
            });
    
            it('should not update array when condition do not match', () => {
                const object = { peoples: [{ id: 1 } ] };
                const result = update(`peoples[id>=10]`, { id: 10, name: 'islam' }, object);
                expect(result).toEqual({ peoples: [{ id: 1 } ] });
            });
    
            it('should update array deep property when conditions satisfied', () => {
                const object = { peoples: [{ id: 2, name: 'islam' }, { id: 3, name: 'xx' } ] };
                const result = update(`peoples[id>=2].name`, 'sabel', object);
                expect(result).toEqual({ peoples: [{ id: 2, name: 'sabel' }, { id: 3, name: 'xx' }] });
            });
    
            it('should update array deep deep property when conditions satisfied', () => {
                const object = { peoples: [{ name: 'islam', friends: [{ age: 20, name: 'max' }, { age: 30, name: 'Aseel' }, { age: 40, name: 'sabel' } ] } ] };
                const result = update(`peoples[name=islam].friends[age>=30].name`, 'Sohaib', object);
                expect(result).toEqual({ peoples: [{ name: 'islam', friends: [{ age: 20, name: 'max' }, { age: 30, name: 'Sohaib' }, { age: 40, name: 'sabel' } ] } ] });
            });
        });

        describe('SmallerThan Symbol', () => {
            it('should update array when conditions satisfied', () => {
                const object = { peoples: [{ id: 2 } ] };
                const result = update(`peoples[id<3]`, { id: 3, name: 'michael' }, object);
                expect(result).toEqual({ peoples: [{ id: 3, name: 'michael' }] });
            });

            it('should update array when conditions satisfied when value is hashed', () => {
                const object = { peoples: [{ id: 2 } ] };
                const result = update(`peoples[id<${v(3)}]`, { id: 3, name: 'michael' }, object);
                expect(result).toEqual({ peoples: [{ id: 3, name: 'michael' }] });
            });

            it('should update first existence when conditions satisfied for singular queries', () => {
                const object = { peoples: [{ id: 2 }, { id: 2, other: true }] };
                const result = update(`peoples[id<12]`, { id: 100, name: 'john' }, object);
                expect(result).toEqual({ peoples: [{ id: 100, name: 'john' }, { id: 2, other: true }] });
            });
    
            it('should not update array when condition do not match', () => {
                const object = { peoples: [{ id: 1 } ] };
                const result = update(`peoples[id<-2]`, { id: 10, name: 'islam' }, object);
                expect(result).toEqual({ peoples: [{ id: 1 } ] });
            });
    
            it('should update array deep property when conditions satisfied', () => {
                const object = { peoples: [{ id: 2, name: 'islam' }, { id: 3, name: 'xx' } ] };
                const result = update(`peoples[id<3].name`, 'sabel', object);
                expect(result).toEqual({ peoples: [{ id: 2, name: 'sabel' }, { id: 3, name: 'xx' }] });
            });
    
            it('should update array deep deep property when conditions satisfied', () => {
                const object = { peoples: [{ name: 'islam', friends: [{ age: 20, name: 'max' }, { age: 30, name: 'Aseel' }, { age: 40, name: 'sabel' } ] } ] };
                const result = update(`peoples[name=islam].friends[age<30].name`, 'Sohaib', object);
                expect(result).toEqual({ peoples: [{ name: 'islam', friends: [{ age: 20, name: 'Sohaib' }, { age: 30, name: 'Aseel' }, { age: 40, name: 'sabel' } ] } ] });
            });
        });

        describe('SmallerThanEquals Symbol', () => {
            it('should update array when conditions satisfied', () => {
                const object = { peoples: [{ id: 2 } ] };
                const result = update(`peoples[id<=2]`, { id: 3, name: 'michael' }, object);
                expect(result).toEqual({ peoples: [{ id: 3, name: 'michael' }] });
            });

            it('should update array when conditions satisfied when value is hashed', () => {
                const object = { peoples: [{ id: 2 } ] };
                const result = update(`peoples[id<=${v(2)}]`, { id: 3, name: 'michael' }, object);
                expect(result).toEqual({ peoples: [{ id: 3, name: 'michael' }] });
            });

            it('should update first existence when conditions satisfied for singular queries', () => {
                const object = { peoples: [{ id: 2 }, { id: 2, other: true }] };
                const result = update(`peoples[id<=2]`, { id: 100, name: 'john' }, object);
                expect(result).toEqual({ peoples: [{ id: 100, name: 'john' }, { id: 2, other: true }] });
            });
    
            it('should not update array when condition do not match', () => {
                const object = { peoples: [{ id: 1 } ] };
                const result = update(`peoples[id<=-100]`, { id: 10, name: 'islam' }, object);
                expect(result).toEqual({ peoples: [{ id: 1 } ] });
            });
    
            it('should update array deep property when conditions satisfied', () => {
                const object = { peoples: [{ id: 2, name: 'islam' }, { id: 3, name: 'xx' } ] };
                const result = update(`peoples[id<=2].name`, 'sabel', object);
                expect(result).toEqual({ peoples: [{ id: 2, name: 'sabel' }, { id: 3, name: 'xx' }] });
            });
    
            it('should update array deep deep property when conditions satisfied', () => {
                const object = { peoples: [{ name: 'islam', friends: [{ age: 20, name: 'max' }, { age: 30, name: 'Aseel' }, { age: 40, name: 'sabel' } ] } ] };
                const result = update(`peoples[name=islam].friends[age<=30].name`, 'Sohaib', object);
                expect(result).toEqual({ peoples: [{ name: 'islam', friends: [{ age: 20, name: 'Sohaib' }, { age: 30, name: 'Aseel' }, { age: 40, name: 'sabel' } ] } ] });
            });
        });
    });
});
