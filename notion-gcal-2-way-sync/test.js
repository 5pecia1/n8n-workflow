const actionMaker = require('./dist/index');

const val =
    [
        {
            "calendar": [
                {
                    "kind": "calendar#event",
                    "etag": "3245053433540000",
                    "id": "5e7guvd7993vut8n0id9mh9bc0",
                    "status": "confirmed",
                    "htmlLink": "https://www.google.com/calendar/event?eid=NWU3Z3V2ZDc5OTN2dXQ4bjBpZDltaDliYzAgdThwbmhqaGMwMHMzMzI1ZjBvZ2wxcTRnc29AZw",
                    "created": "2021-06-01T05:51:56.000Z",
                    "updated": "2021-06-01T05:51:56.770Z",
                    "summary": "test4",
                    "description": "NOTION_ID: 77ccd5ff-f591-47bb-a9a9-79ebe2d9bc67 https://notion.so/77ccd5ff-f591-47bb-a9a9-79ebe2d9bc67 ",
                    "creator": {
                        "email": "xxxxx@gmail.com"
                    },
                    "organizer": {
                        "email": "u8pnhjhc00s3325f0ogl1q4gso@group.calendar.google.com",
                        "displayName": "test notion",
                        "self": true
                    },
                    "start": {
                        "dateTime": "2021-06-01T14:00:00+09:00",
                        "timeZone": "Asia/Seoul"
                    },
                    "end": {
                        "dateTime": "2021-06-01T14:30:00+09:00",
                        "timeZone": "Asia/Seoul"
                    },
                    "iCalUID": "5e7guvd7993vut8n0id9mh9bc0@google.com",
                    "sequence": 0,
                    "reminders": {
                        "useDefault": true
                    },
                    "eventType": "default"
                },
                {
                    "kind": "calendar#event",
                    "etag": "3245053639186000",
                    "id": "k6nvds4ldae1g8i8s3706a13fg",
                    "status": "confirmed",
                    "htmlLink": "https://www.google.com/calendar/event?eid=azZudmRzNGxkYWUxZzhpOHMzNzA2YTEzZmcgdThwbmhqaGMwMHMzMzI1ZjBvZ2wxcTRnc29AZw",
                    "created": "2021-06-01T05:51:58.000Z",
                    "updated": "2021-06-01T05:53:39.593Z",
                    "summary": "test2",
                    "description": "NOTION_ID: 2c15d497-847b-4244-aded-8ca32d140814 https://notion.so/2c15d497-847b-4244-aded-8ca32d140814 ",
                    "creator": {
                        "email": "xxxxx@gmail.com"
                    },
                    "organizer": {
                        "email": "u8pnhjhc00s3325f0ogl1q4gso@group.calendar.google.com",
                        "displayName": "test notion",
                        "self": true
                    },
                    "start": {
                        "date": "2021-05-31"
                    },
                    "end": {
                        "date": "2021-06-01"
                    },
                    "iCalUID": "k6nvds4ldae1g8i8s3706a13fg@google.com",
                    "sequence": 1,
                    "reminders": {
                        "useDefault": false
                    },
                    "eventType": "default"
                },
                {
                    "kind": "calendar#event",
                    "etag": "3245054481708000",
                    "id": "pqfaevg74l0ijglfijqmqg1qbs",
                    "status": "confirmed",
                    "htmlLink": "https://www.google.com/calendar/event?eid=cHFmYWV2Zzc0bDBpamdsZmlqcW1xZzFxYnMgdThwbmhqaGMwMHMzMzI1ZjBvZ2wxcTRnc29AZw",
                    "created": "2021-06-01T05:43:42.000Z",
                    "updated": "2021-06-01T06:00:40.854Z",
                    "summary": "test",
                    "description": "NOTION_ID: eb2f8bcf-7d5a-4740-b543-acba30613b55 https://notion.so/eb2f8bcf-7d5a-4740-b543-acba30613b55 ",
                    "creator": {
                        "email": "xxxxx@gmail.com"
                    },
                    "organizer": {
                        "email": "u8pnhjhc00s3325f0ogl1q4gso@group.calendar.google.com",
                        "displayName": "test notion",
                        "self": true
                    },
                    "start": {
                        "dateTime": "2021-06-02T00:00:00+09:00",
                        "timeZone": "Asia/Seoul"
                    },
                    "end": {
                        "dateTime": "2021-06-02T13:00:00+09:00",
                        "timeZone": "Asia/Seoul"
                    },
                    "iCalUID": "pqfaevg74l0ijglfijqmqg1qbs@google.com",
                    "sequence": 2,
                    "reminders": {
                        "useDefault": true
                    },
                    "eventType": "default"
                },
                {
                    "kind": "calendar#event",
                    "etag": "3245056361194000",
                    "id": "6s6f6ekk322isf1jbmqn7qpndg",
                    "status": "confirmed",
                    "htmlLink": "https://www.google.com/calendar/event?eid=NnM2ZjZla2szMjJpc2YxamJtcW43cXBuZGcgdThwbmhqaGMwMHMzMzI1ZjBvZ2wxcTRnc29AZw",
                    "created": "2021-06-01T05:51:55.000Z",
                    "updated": "2021-06-01T06:16:20.597Z",
                    "summary": "test3",
                    "description": "NOTION_ID: 4e05b4a5-ecae-4889-aa38-7715056a4ab2 https://notion.so/4e05b4a5-ecae-4889-aa38-7715056a4ab2 ",
                    "creator": {
                        "email": "xxxxx@gmail.com"
                    },
                    "organizer": {
                        "email": "u8pnhjhc00s3325f0ogl1q4gso@group.calendar.google.com",
                        "displayName": "test notion",
                        "self": true
                    },
                    "start": {
                        "date": "2021-06-02"
                    },
                    "end": {
                        "date": "2021-06-05"
                    },
                    "iCalUID": "6s6f6ekk322isf1jbmqn7qpndg@google.com",
                    "sequence": 3,
                    "reminders": {
                        "useDefault": false
                    },
                    "eventType": "default"
                }
            ]
        },
        {
            "notion": [
                {
                    "object": "page",
                    "id": "4e05b4a5-ecae-4889-aa38-7715056a4ab2",
                    "created_time": "2021-06-01T05:51:00.000Z",
                    "last_edited_time": "2021-06-01T06:30:00.000Z",
                    "parent": {
                        "type": "database_id",
                        "database_id": "2ad4848e-ab72-4165-8086-0d1d2efc34c6"
                    },
                    "archived": false,
                    "properties": {
                        "FIX-End": {
                            "id": "<vVo",
                            "type": "date",
                            "date": {
                                "start": "2021-06-02",
                                "end": "2021-06-06"
                            }
                        },
                        "GCal Id": {
                            "id": "Czo|",
                            "type": "rich_text",
                            "rich_text": [
                                {
                                    "type": "text",
                                    "text": {
                                        "content": "6s6f6ekk322isf1jbmqn7qpndg",
                                        "link": null
                                    },
                                    "annotations": {
                                        "bold": false,
                                        "italic": false,
                                        "strikethrough": false,
                                        "underline": false,
                                        "code": false,
                                        "color": "default"
                                    },
                                    "plain_text": "6s6f6ekk322isf1jbmqn7qpndg",
                                    "href": null
                                }
                            ]
                        },
                        "Last Edited Time": {
                            "id": "yGwT",
                            "type": "last_edited_time",
                            "last_edited_time": "2021-06-01T06:30:00.000Z"
                        },
                        "Name": {
                            "id": "title",
                            "type": "title",
                            "title": [
                                {
                                    "type": "text",
                                    "text": {
                                        "content": "test3",
                                        "link": null
                                    },
                                    "annotations": {
                                        "bold": false,
                                        "italic": false,
                                        "strikethrough": false,
                                        "underline": false,
                                        "code": false,
                                        "color": "default"
                                    },
                                    "plain_text": "test3",
                                    "href": null
                                }
                            ]
                        }
                    }
                },
                {
                    "object": "page",
                    "id": "eb2f8bcf-7d5a-4740-b543-acba30613b55",
                    "created_time": "2021-06-01T05:37:00.000Z",
                    "last_edited_time": "2021-06-01T05:57:22.446Z",
                    "parent": {
                        "type": "database_id",
                        "database_id": "2ad4848e-ab72-4165-8086-0d1d2efc34c6"
                    },
                    "archived": false,
                    "properties": {
                        "FIX-End": {
                            "id": "<vVo",
                            "type": "date",
                            "date": {
                                "start": "2021-06-02T00:00:00.000+09:00",
                                "end": "2021-06-02T13:00:00.000+09:00"
                            }
                        },
                        "GCal Id": {
                            "id": "Czo|",
                            "type": "rich_text",
                            "rich_text": [
                                {
                                    "type": "text",
                                    "text": {
                                        "content": "pqfaevg74l0ijglfijqmqg1qbs",
                                        "link": null
                                    },
                                    "annotations": {
                                        "bold": false,
                                        "italic": false,
                                        "strikethrough": false,
                                        "underline": false,
                                        "code": false,
                                        "color": "default"
                                    },
                                    "plain_text": "pqfaevg74l0ijglfijqmqg1qbs",
                                    "href": null
                                }
                            ]
                        },
                        "Last Edited Time": {
                            "id": "yGwT",
                            "type": "last_edited_time",
                            "last_edited_time": "2021-06-01T05:57:22.446Z"
                        },
                        "Name": {
                            "id": "title",
                            "type": "title",
                            "title": [
                                {
                                    "type": "text",
                                    "text": {
                                        "content": "test",
                                        "link": null
                                    },
                                    "annotations": {
                                        "bold": false,
                                        "italic": false,
                                        "strikethrough": false,
                                        "underline": false,
                                        "code": false,
                                        "color": "default"
                                    },
                                    "plain_text": "test",
                                    "href": null
                                }
                            ]
                        }
                    }
                },
                {
                    "object": "page",
                    "id": "2c15d497-847b-4244-aded-8ca32d140814",
                    "created_time": "2021-06-01T05:51:00.000Z",
                    "last_edited_time": "2021-06-01T05:53:51.952Z",
                    "parent": {
                        "type": "database_id",
                        "database_id": "2ad4848e-ab72-4165-8086-0d1d2efc34c6"
                    },
                    "archived": false,
                    "properties": {
                        "FIX-End": {
                            "id": "<vVo",
                            "type": "date",
                            "date": {
                                "start": "2021-05-31",
                                "end": null
                            }
                        },
                        "GCal Id": {
                            "id": "Czo|",
                            "type": "rich_text",
                            "rich_text": [
                                {
                                    "type": "text",
                                    "text": {
                                        "content": "k6nvds4ldae1g8i8s3706a13fg",
                                        "link": null
                                    },
                                    "annotations": {
                                        "bold": false,
                                        "italic": false,
                                        "strikethrough": false,
                                        "underline": false,
                                        "code": false,
                                        "color": "default"
                                    },
                                    "plain_text": "k6nvds4ldae1g8i8s3706a13fg",
                                    "href": null
                                }
                            ]
                        },
                        "Last Edited Time": {
                            "id": "yGwT",
                            "type": "last_edited_time",
                            "last_edited_time": "2021-06-01T05:53:51.952Z"
                        },
                        "Name": {
                            "id": "title",
                            "type": "title",
                            "title": [
                                {
                                    "type": "text",
                                    "text": {
                                        "content": "test2",
                                        "link": null
                                    },
                                    "annotations": {
                                        "bold": false,
                                        "italic": false,
                                        "strikethrough": false,
                                        "underline": false,
                                        "code": false,
                                        "color": "default"
                                    },
                                    "plain_text": "test2",
                                    "href": null
                                }
                            ]
                        }
                    }
                },
                {
                    "object": "page",
                    "id": "77ccd5ff-f591-47bb-a9a9-79ebe2d9bc67",
                    "created_time": "2021-06-01T05:51:00.000Z",
                    "last_edited_time": "2021-06-01T05:51:57.732Z",
                    "parent": {
                        "type": "database_id",
                        "database_id": "2ad4848e-ab72-4165-8086-0d1d2efc34c6"
                    },
                    "archived": false,
                    "properties": {
                        "FIX-End": {
                            "id": "<vVo",
                            "type": "date",
                            "date": {
                                "start": "2021-06-01T14:00:00.000+09:00",
                                "end": null
                            }
                        },
                        "GCal Id": {
                            "id": "Czo|",
                            "type": "rich_text",
                            "rich_text": [
                                {
                                    "type": "text",
                                    "text": {
                                        "content": "5e7guvd7993vut8n0id9mh9bc0",
                                        "link": null
                                    },
                                    "annotations": {
                                        "bold": false,
                                        "italic": false,
                                        "strikethrough": false,
                                        "underline": false,
                                        "code": false,
                                        "color": "default"
                                    },
                                    "plain_text": "5e7guvd7993vut8n0id9mh9bc0",
                                    "href": null
                                }
                            ]
                        },
                        "Last Edited Time": {
                            "id": "yGwT",
                            "type": "last_edited_time",
                            "last_edited_time": "2021-06-01T05:51:57.732Z"
                        },
                        "Name": {
                            "id": "title",
                            "type": "title",
                            "title": [
                                {
                                    "type": "text",
                                    "text": {
                                        "content": "test4",
                                        "link": null
                                    },
                                    "annotations": {
                                        "bold": false,
                                        "italic": false,
                                        "strikethrough": false,
                                        "underline": false,
                                        "code": false,
                                        "color": "default"
                                    },
                                    "plain_text": "test4",
                                    "href": null
                                }
                            ]
                        }
                    }
                }
            ]
        }
    ];
const result = actionMaker.main(val.map(v => ({ json: v })));

console.log(JSON.stringify(result, null, 2));