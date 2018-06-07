<?php
//    print_r($_POST);

    if (isset($_POST['submit'])) {

        echo $_POST['submit'];

        // Retrieve new event
        $eventName = $_POST['eventName']; // text.headline
        $eventDescription = $_POST['eventContent']; // text.text
        $eventCategory = $_POST['eventCategory']; // append to text.text for now
        $eventUrl = $_POST['eventUrl']; // media.url
        $eventUrlCaption = $_POST['urlCaption']; // media.caption

        // Separate out month, day, year
        $eventDate = explode("-", $_POST['startDate']); // formatted YYYY/MM/DD
        $year = $eventDate[0]; // start_date.year
        $month = $eventDate[1]; // start_date.month
        $day = $eventDate[2]; // start_date.day


        $event = array();
        $event['text']['headline'] = $eventName;
        $event['text']['text'] = $eventDescription . " - " . $eventCategory;
        $event['media']['url'] = $eventUrl;
        $event['media']['caption'] = $eventUrlCaption;
        $event['start_date']['month'] = $month;
        $event['start_date']['day'] = $day;
        $event['start_date']['year'] = $year;


        // Pull the contents of the events.json file
        $file = file_get_contents("test_events.json");

        $timeline = json_decode($file, true);

        array_push($timeline['events'], $event);

        $prettyTimeline = json_encode($timeline, JSON_PRETTY_PRINT);

        if (is_writable("test_events.json")) {
            file_put_contents("test_events.json", $prettyTimeline);
        }

//        // Create a temporary array to hold all events
//
//
//        // Add the new event to the events array
//        $tempEvent[] = $event;
//        // make sure the file is writable
//
//        // if it is, write the temporary array back into the file.
//        echo is_writable("test_events.json") ? file_put_contents("test_events.json",
//            json_encode($tempEvent)) : "Something went wrong!";

    }
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
<form class="form" action="" method="post" role="form" autocomplete="off">
    <div class="form-group">
        <label for="eventName">Event Name</label>
        <input type="text" class="form-control" id="eventName" name="eventName">
    </div>
    <div class="form-group">
        <label for="eventContent">Event Content</label>
        <textarea class="form-control" id="eventContent" name="eventContent" rows="3"></textarea>
    </div>
    <div class="form-group">
        <label for="eventImage">Event Images</label>
        <input type="file" class="form-control-file" id="eventImage">
    </div>
    <div class="form-group">
        <label for="eventCategory">Event Category</label>
        <select class="form-control" id="eventCategory" name="eventCategory">
            <option selected>Entertainment</option>
            <option>Hospitality</option>
            <option>Travel</option>
        </select>
    </div>
    <div class="form-group">
        <label for="startDate">Event Date</label>
        <input type="text" class="form-control" id="startDate" name="startDate">
    </div>
    <div class="form-group">
        <label for="eventUrl">URL</label>
        <input type="text" class="form-control" id="eventUrl" name="eventUrl">
    </div>
    <div class="form-group">
        <input type="submit" name="submit" class="btn btn-success btn-lg float-right">
    </div>
</form>

</body>
</html>