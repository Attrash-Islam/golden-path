import { get, v } from '.';

describe('get', () => {
    it('should get one level path when exist', () => {
        const object = { islam: 1 };
        const result = get('islam', object);
        expect(result).toEqual(1);
    });

    it('should return undefined when path not exist', () => {
        const object = { sabel: 2 };
        const result = get('islam', object);
        expect(result).toEqual(undefined);
    });

    it('should return the whole object when path is empty', () => {
        const object = { islam: 1 };
        const result = get('', object);
        expect(result).toEqual({ islam: 1 });
    });

    it('should get array item when exist', () => {
        const object = { friends: [2] };
        const result = get('friends.0', object);
        expect(result).toEqual(2);
    });

    it('should get nested path in object when exist', () => {
        const object = { islam: { is: { nested: true } } };
        const result = get('islam.is.nested', object);
        expect(result).toEqual(true);
    });

    it('should return undefined for nested path in object when not exist', () => {
        const object = { sabel: 'wife' };
        const result = get('islam.is.exist.now', object);
        expect(result).toEqual(undefined);
    });

    it('should get the property path in nested array of objects', () => {
        const object = { peoples: [{ id: 1 } ] };
        const result = get(`peoples.${0}.id`, object);
        expect(result).toEqual(1);
    });

    describe('Conditional Gets For Arrays', () => {
        describe('Equals Symbol', () => {
            it('should get array item when conditions satisfied', () => {
                const object = { peoples: [{ id: 1 }, { id: 5 } ] };
                const result = get(`peoples[id=1]`, object);
                expect(result).toEqual({ id: 1 });
            });

            it('should get array item when conditions satisfied when value is hashed', () => {
                const object = { peoples: [{ id: 1 }, { id: 5 } ] };
                const result = get(`peoples[id=${v(1)}]`, object);
                expect(result).toEqual({ id: 1 });
            });

            it('should return first existence when conditions satisfied for singular queries', () => {
                const object = { peoples: [{ id: 1 }, { id: 1, other: true }] };
                const result = get(`peoples[id=1]`, object);
                expect(result).toEqual({ id: 1 });
            });

            it('should return all existence when conditions satisfied for greedy queries', () => {
                const object = { peoples: [{ id: 1 }, { id: 1, other: true }] };
                const result = get(`peoples*[id=1]`, object);
                expect(result).toEqual([{ id: 1 }, { id: 1, other: true }]);
            });

            it('should return relevant existence when multiple conditions are used', () => {
                const object = { peoples: [{ id: 1, other: false }, { id: 1, other: true }] };
                const result = get(`peoples[id=1][other=true]`, object);
                expect(result).toEqual({ id: 1, other: true });
            });

            it('should return relevant existence when multiple conditions are used with complex string value', () => {
                const complexString = '[]&%.';
                const object = { peoples: [{ id: 1, other: false }, { id: 1, other: complexString }] };
                const result = get(`peoples[id=1][other="${v(complexString)}"]`, object);
                expect(result).toEqual({ id: 1, other: complexString });
            });

            it('should return relevant existence when multiple conditions are used with complex string key', () => {
                const complexString = '[]&%.';
                const object = { peoples: [{ id: 1, other: false }, { id: 1, [complexString]: 1 }] };
                const result = get(`peoples[id=1][${v(complexString)}=1]`, object);
                expect(result).toEqual({ id: 1, [complexString]: 1 });
            });

            it('should return second item when first item type is not identical when conditions satisfied', () => {
                const object = { peoples: [{ id: '1' }, { id: 1 }] };
                const result = get(`peoples[id=1]`, object);
                expect(result).toEqual({ id: 1 });
            });

            it('should return undefined when condition do not match', () => {
                const object = { peoples: [{ id: 1 }, { id: 3 } ] };
                const result = get(`peoples[id=2]`, object);
                expect(result).toEqual(undefined);
            });

            it('should return array deep property when conditions satisfied in first match queries when being the first token', () => {
                const array = [{ id: 1, name: 'islam', visited: true }, { id: 1, name: 'sabel', visited: false }];
                const result = get(`[id=1]`, array);
                expect(result).toEqual({ id: 1, name: 'islam', visited: true });

                const result2 = get(`[id=1].name`, array);
                expect(result2).toEqual('islam');
            });
    
            it('should return array item deep property when conditions satisfied', () => {
                const object = { peoples: [{ id: 1, name: 'islam' }, { id: 10, name: 'sabel' }] };
                const result = get(`peoples[id=1].name`, object);
                expect(result).toEqual('islam');
            });

            it('should return array deep property when conditions satisfied in greedy queries', () => {
                const object = { peoples: [{ id: 1, name: 'islam', visited: true }, { id: 1, name: 'sabel', visited: false }] };
                const result = get(`peoples*[id=1].visited`, object);
                expect(result).toEqual([true, false]);
            });

            it('should return empty array when conditions don\'t satisfy in greedy queries', () => {
                const object = { peoples: [{ id: 1, name: 'islam', visited: true }, { id: 1, name: 'sabel', visited: false }] };
                const result = get(`peoples*[id=3].visited`, object);
                expect(result).toEqual([]);
            });

            it('should return array deep property when conditions satisfied in non-greedy queries when being the first token', () => {
                const array = [{ id: 1, name: 'islam', visited: true }, { id: 1, name: 'sabel', visited: false }];
                const result = get(`[id=1]`, array);
                expect(result).toEqual({ id: 1, name: 'islam', visited: true });

                const result2 = get(`[id=1].name`, array);
                expect(result2).toEqual('islam');
            });

            it('should return array deep property when conditions satisfied in greedy queries when being the first token', () => {
                const array = [{ id: 1, name: 'islam', visited: true }, { id: 1, name: 'sabel', visited: false }];
                const result = get(`*[id=1]`, array);
                expect(result).toEqual([{ id: 1, name: 'islam', visited: true }, { id: 1, name: 'sabel', visited: false }]);

                const result2 = get(`*[id=1].name`, array);
                expect(result2).toEqual(['islam', 'sabel']);
            });

            it('should return all array items being nested in object when conditions satisfied in greedy queries when being the only the query token', () => {
                const array = { array: [{ id: 1, name: 'islam', visited: true }, { id: 1, name: 'sabel', visited: false }] };
                const result = get(`array.*`, array);
                expect(result).toEqual([{ id: 1, name: 'islam', visited: true }, { id: 1, name: 'sabel', visited: false }]);
            });

            it('should return all array items when conditions satisfied in greedy queries when being the only the query token', () => {
                const array = [{ id: 1, name: 'islam', visited: true }, { id: 1, name: 'sabel', visited: false }];
                const result = get(`*`, array);
                expect(result).toEqual([{ id: 1, name: 'islam', visited: true }, { id: 1, name: 'sabel', visited: false }]);
            });

            it('should return pluck array items property when conditions satisfied in greedy queries', () => {
                const array = [{ id: 1, name: 'islam', visited: true }, { id: 1, name: 'sabel', visited: false }];
                const result = get(`*.name`, array);
                expect(result).toEqual(['islam', 'sabel']);
            });

            it('should return all array names being nested in object when conditions satisfied in greedy queries when being the only the query token', () => {
                const array = { array: [{ id: 1, name: 'islam', visited: true }, { id: 1, name: 'sabel', visited: false }] };
                const result = get(`array.*.name`, array);
                expect(result).toEqual(['islam', 'sabel']);
            });
 
            it('should return array deep deep property when conditions satisfied', () => {
                const object = { peoples: [{ name: 'islam', friends: [{ sex: 'male', name: 'max' }, { sex: 'male', name: 'Aseel' }, { sex: 'female', name: 'sabel' } ] } ] };
                const result = get(`peoples[name='islam'].friends[sex='male'].name`, object);
                expect(result).toEqual('max');
            });

            it('should return array deep deep property when conditions satisfied in multiple greedy queries', () => {
                const object = {
                    peoples: [
                        {
                            name: 'Islam',
                            sex: 'male',
                            friends: [
                                {
                                    sex: 'male',
                                    name: 'max'
                                },
                                {
                                    sex: 'male',
                                    name: 'Aseel'
                                },
                                {
                                    sex: 'female',
                                    name: 'sabel'
                                }
                            ]
                        },
                        {
                            name: 'Harel',
                            sex: 'male',
                            friends: [
                                {
                                    sex: 'male',
                                    name: 'Max'
                                },
                                {
                                    sex: 'male',
                                    name: 'Aseel'
                                },
                                {
                                    sex: 'female',
                                    name: 'sabel'
                                }
                            ]
                        }
                    ]
                };

                const result = get(`peoples*[sex='male'].friends*[sex='male'].name`, object);
                expect(result).toEqual(['max', 'Aseel', 'Max', 'Aseel']);
            });


            it('should return array deep deep property when conditions satisfied in single greedy queries', () => {
                const object = {
                    peoples: [
                        {
                            name: 'Islam',
                            sex: 'male',
                            friends: [
                                {
                                    sex: 'male',
                                    name: 'max'
                                },
                                {
                                    sex: 'male',
                                    name: 'Aseel'
                                },
                                {
                                    sex: 'female',
                                    name: 'sabel'
                                }
                            ]
                        },
                        {
                            name: 'Harel',
                            sex: 'male',
                            friends: [
                                {
                                    sex: 'male',
                                    name: 'Max'
                                },
                                {
                                    sex: 'male',
                                    name: 'Aseel'
                                },
                                {
                                    sex: 'female',
                                    name: 'sabel'
                                }
                            ]
                        }
                    ]
                };

                const result = get(`peoples*[sex='male'].friends[sex='male'].name`, object);
                expect(result).toEqual(['max', 'Max']);
            });

            it('should return array deep deep property when conditions satisfied in single greedy queries', () => {
                const object = {
                    peoples: [
                        {
                            name: 'Islam',
                            sex: 'male',
                            friends: [
                                {
                                    sex: 'male',
                                    name: 'max'
                                },
                                {
                                    sex: 'male',
                                    name: 'Aseel'
                                },
                                {
                                    sex: 'female',
                                    name: 'sabel'
                                }
                            ]
                        },
                        {
                            name: 'Harel',
                            sex: 'male',
                            friends: [
                                {
                                    sex: 'male',
                                    name: 'Max'
                                },
                                {
                                    sex: 'male',
                                    name: 'Aseel'
                                },
                                {
                                    sex: 'female',
                                    name: 'sabel'
                                }
                            ]
                        }
                    ]
                };

                const result = get(`peoples[sex='male'].friends*[sex='male'].name`, object);
                expect(result).toEqual(['max', 'Aseel']);
            });
        });

        describe('NotEquals Symbol', () => {
            it('should return array when conditions satisfied', () => {
                const object = { peoples: [{ id: 2 }, { id: 3 } ] };
                const result = get(`peoples[id!=1]`, object);
                expect(result).toEqual({ id: 2 });
            });

            it('should return array when conditions satisfied when value is hashed', () => {
                const object = { peoples: [{ id: 2 }, { id: 3 } ] };
                const result = get(`peoples[id!=${v(1)}]`, object);
                expect(result).toEqual({ id: 2 });
            });

            it('should return first existence when conditions satisfied for singular queries', () => {
                const object = { peoples: [{ id: 2 }, { id: 2, other: true }] };
                const result = get(`peoples[id!=1]`, object);
                expect(result).toEqual({ id: 2 });
            });

            it('should return relevant item when type is not identical when conditions satisfied', () => {
                const object = { peoples: [{ id: '2' }, { id: '3' }] };
                const result = get(`peoples[id!=2]`, object);
                expect(result).toEqual({ id: '2' });
            });
    
            it('should return undefined when condition do not match', () => {
                const object = { peoples: [{ id: 1 } ] };
                const result = get(`peoples[id!=1]`, object);
                expect(result).toEqual(undefined);
            });
    
            it('should return array deep property when conditions satisfied', () => {
                const object = { peoples: [{ id: 2, name: 'islam' }, { id: 3, name: 'xx' } ] };
                const result = get(`peoples[id!=1].name`, object);
                expect(result).toEqual('islam');
            });
    
            it('should return array deep deep property when conditions satisfied', () => {
                const object = { peoples: [{ name: 'islam', friends: [{ sex: 'male', name: 'max' }, { sex: 'male', name: 'Aseel' }, { sex: 'female', name: 'sabel' } ] } ] };
                const result = get(`peoples[name!='john'].friends[sex!='female'].name`, object);
                expect(result).toEqual('max');
            });
        });

        describe('BiggerThan Symbol', () => {
            it('should return array when conditions satisfied', () => {
                const object = { peoples: [{ id: 2 } ] };
                const result = get(`peoples[id>1]`, object);
                expect(result).toEqual({ id: 2 });
            });

            it('should return array when conditions satisfied when value is hashed', () => {
                const object = { peoples: [{ id: 2 } ] };
                const result = get(`peoples[id>${v(1)}]`, object);
                expect(result).toEqual({ id: 2 });
            });

            it('should return first existence when conditions satisfied for singular queries', () => {
                const object = { peoples: [{ id: 2 }, { id: 2, other: true }] };
                const result = get(`peoples[id>1]`, object);
                expect(result).toEqual({ id: 2 });
            });

            it('should return undefined when condition do not match', () => {
                const object = { peoples: [{ id: 1 } ] };
                const result = get(`peoples[age>30]`, object);
                expect(result).toEqual(undefined);
            });

            it('should return array deep property when conditions satisfied', () => {
                const object = { peoples: [{ id: 2, name: 'islam' }, { id: 3, name: 'xx' } ] };
                const result = get(`peoples[id>1].name`, object);
                expect(result).toEqual('islam');
            });
    
            it('should return array deep deep property when conditions satisfied', () => {
                const object = { peoples: [{ name: 'islam', friends: [{ age: 20, name: 'max' }, { age: 30, name: 'Aseel' }, { age: 40, name: 'sabel' } ] } ] };
                const result = get(`peoples[name='islam'].friends[age>29].name`, object);
                expect(result).toEqual('Aseel');
            });
        });

        describe('BiggerThanEquals Symbol', () => {
            it('should return array when conditions satisfied', () => {
                const object = { peoples: [{ id: 2 } ] };
                const result = get(`peoples[id>=1]`, object);
                expect(result).toEqual({ id: 2 });
            });

            it('should return array when conditions satisfied when value is hashed', () => {
                const object = { peoples: [{ id: 2 } ] };
                const result = get(`peoples[id>=${v(1)}]`, object);
                expect(result).toEqual({ id: 2 });
            });

            it('should return first existence when conditions satisfied for singular queries', () => {
                const object = { peoples: [{ id: 2 }, { id: 2, other: true }] };
                const result = get(`peoples[id>=2]`, object);
                expect(result).toEqual({ id: 2 });
            });
    
            it('should return undefined when condition do not match', () => {
                const object = { peoples: [{ id: 1 } ] };
                const result = get(`peoples[id>=10]`, object);
                expect(result).toEqual(undefined);
            });
    
            it('should return array deep property when conditions satisfied', () => {
                const object = { peoples: [{ id: 2, name: 'islam' }, { id: 3, name: 'xx' } ] };
                const result = get(`peoples[id>=2].name`, object);
                expect(result).toEqual('islam');
            });
    
            it('should return array deep deep property when conditions satisfied', () => {
                const object = { peoples: [{ name: 'islam', friends: [{ age: 20, name: 'max' }, { age: 30, name: 'Aseel' }, { age: 40, name: 'sabel' } ] } ] };
                const result = get(`peoples[name='islam'].friends[age>=30].name`, object);
                expect(result).toEqual('Aseel');
            });
        });

        describe('SmallerThan Symbol', () => {
            it('should return array when conditions satisfied', () => {
                const object = { peoples: [{ id: 2 } ] };
                const result = get(`peoples[id<3]`, object);
                expect(result).toEqual({ id: 2 });
            });

            it('should return array when conditions satisfied when value is hashed', () => {
                const object = { peoples: [{ id: 2 } ] };
                const result = get(`peoples[id<${v(3)}]`, object);
                expect(result).toEqual({ id: 2 });
            });

            it('should return first existence when conditions satisfied for singular queries', () => {
                const object = { peoples: [{ id: 2 }, { id: 2, other: true }] };
                const result = get(`peoples[id<12]`, object);
                expect(result).toEqual({ id: 2 });
            });
    
            it('should return undefined when condition do not match', () => {
                const object = { peoples: [{ id: 1 } ] };
                const result = get(`peoples[id<-2]`, object);
                expect(result).toEqual(undefined);
            });
    
            it('should return array deep property when conditions satisfied', () => {
                const object = { peoples: [{ id: 2, name: 'islam' }, { id: 3, name: 'xx' } ] };
                const result = get(`peoples[id<3].name`, object);
                expect(result).toEqual('islam');
            });
    
            it('should return array deep deep property when conditions satisfied', () => {
                const object = { peoples: [{ name: 'islam', friends: [{ age: 20, name: 'max' }, { age: 30, name: 'Aseel' }, { age: 40, name: 'sabel' } ] } ] };
                const result = get(`peoples[name='islam'].friends[age<30].name`, object);
                expect(result).toEqual('max');
            });
        });

        describe('SmallerThanEquals Symbol', () => {
            it('should return array when conditions satisfied', () => {
                const object = { peoples: [{ id: 2 } ] };
                const result = get(`peoples[id<=2]`, object);
                expect(result).toEqual({ id: 2 });
            });

            it('should return array when conditions satisfied when value is hashed', () => {
                const object = { peoples: [{ id: 2 } ] };
                const result = get(`peoples[id<=${v(2)}]`, object);
                expect(result).toEqual({ id: 2 });
            });

            it('should return first existence when conditions satisfied for singular queries', () => {
                const object = { peoples: [{ id: 2 }, { id: 2, other: true }] };
                const result = get(`peoples[id<=2]`, object);
                expect(result).toEqual({ id: 2 },);
            });
    
            it('should return undefined when condition do not match', () => {
                const object = { peoples: [{ id: 1 } ] };
                const result = get(`peoples[id<=-100]`, object);
                expect(result).toEqual(undefined);
            });
    
            it('should return array deep property when conditions satisfied', () => {
                const object = { peoples: [{ id: 2, name: 'islam' }, { id: 3, name: 'xx' } ] };
                const result = get(`peoples[id<=2].name`, object);
                expect(result).toEqual('islam');
            });
    
            it('should return array deep deep property when conditions satisfied', () => {
                const object = { peoples: [{ name: 'islam', friends: [{ age: 20, name: 'max' }, { age: 30, name: 'Aseel' }, { age: 40, name: 'sabel' } ] } ] };
                const result = get(`peoples[name='islam'].friends[age<=30].name`, object);
                expect(result).toEqual('max');
            });
        });
    });
});
