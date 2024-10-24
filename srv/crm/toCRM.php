<?php

ini_set('display_errors', 1);
$time = date("d.m H:i");
$data = $_POST;

file_put_contents("leads", $time." ".print_r($data, true)."".PHP_EOL, FILE_APPEND);

$user = $_POST['user'];
$mobile = $_POST['mobile'];

echo  $user, ' 111 ', $mobile;

$jsonData = json_decode(file_get_contents('php://input'), true);
$name = $jsonData['user'];
$tel = $jsonData['mobile'];

echo  $name, ' 222 ', $tel;

require_once "CRM.php";
$resp_user = '10052958';
$status_id = '60237550';
define('AC_PHONE_CID', '1496205');
define('AC_EMAIL_CID', '1496207');

$config = array(
    'secret_key' => "jLilAD0bNLHir7ygk0LGiYz5DUJOJ8PLtU3rZiQqZoZxNllFwmSp9tvnOgfxiGsM",
    'intagration_id' => "92c7fb67-5808-440a-9382-1a0776c94ac5",
    'client_domen' => "palmieri",
    'redirect_uri' => "https://stop-dolg.pro/toCRM.php",
    'auth_token' => "def502002e68ee79577d711c5087bc9d9f6e03bb9d98e166dae7cbedf14d4df7c34e5f4e6b32abb174808d4e6c7a183971da81c9c8835e24c3bf7e5d1336a0983f8505333a652a09f8b5cfa15262c2a86024d6fd6261ca53f8dc3cffb4c722971dbcc7dfcaea76f5bc732b6e487ce6ed295bd70840e770e4c8b37ffb5c073fcea42a869044b510feb36ebeb99df1d85225a86b29f753226b66654cdb8d747a69a93bf7dac75e45d99490b9826cf802d33321ddd2b952939f65078ae8e0cd1fe63789ab04775b3a903df7811be95dd67c771eea662dca19f0bb819545455f7a75cead782a673d70d763d086472795a35b52d931bd3cf2344dd175e7846fa10ea3b596e894aaa9eeedb73153bfc2c99e0558f32bba483e33d312f59f5a5cbcf92c1d1c215111ecd20936efa695764ed5fe61f26993c275c5e823ff105272f74008be42db53236199eae3cb58c122ee68d4c5ed76cf83dd6477e0939ef87a62028f7125f22e4598b84f16e4d23d77e59e5b71e6c80c34760ee35e75f2d565f48138f5d9810f534c29e570e9ed2668100473e2507f61950a962b973b4b1922e3981e2b6df8beca7cb995a746c919c40ecce33a044678f23ed21bd553805e110e8f21a8f3c3b2c75fecd60dd8226d31ed43edb9d560b7e36b4ffbdedce41c91f91e12000cbba335c6"
);

$sitename = $_SERVER['HTTP_REFERER'];
if (isset($data['mobile'])) $phone = $data['mobile'];

//$phone = preg_replace("/[^0-9]/", '', $phoneQ);

$name = $data['user'] ?? 'Не указано';

$amo = new EbClientAmocrm($config['secret_key'], $config['intagration_id'], $config['client_domen'], $config['redirect_uri'], $config['auth_token']);
if ($phone || $email) {

    $contact_config = array(
        'name' => $name,
        'responsible_user_id' => $resp_user,
        'custom_fields' => [
            [
                'id' => AC_PHONE_CID,
                'value' => $phone,
                'enum' => 'WORK'
            ]
        ]
    );
    $c = $amo->create_contact($contact_config);
    $contact_id = $c[1]['_embedded']['items'][0]['id'];

    if ($contact_id) {
        $lead_config = array(
            'contacts_id' => array($contact_id),
            'name' => 'ЗАЯВКА',
            'responsible_user_id' => $resp_user,
            'status_id' => $status_id,
            'tags' => 'quiz',
            'custom_fields' => [

                ['id' => 289525, 'value' => $utm_source],
                ['id' => 289527, 'value' => $utm_medium],
                ['id' => 289529, 'value' => $utm_campaign],
                ['id' => 330581, 'value' => $utm_content],
                ['id' => 289531, 'value' => $utm_term],
            ]
        );
        $lead = $amo->create_lead($lead_config);
        $note['text'] = 'ЗАЯВКА :' . "\n";
        $note['text'] .= $telegramMessage . "\n";
        $amo->create_note($lead, $note['text']);
    }

    $tasks['add'] = array(
        array(
            'element_id' => $lead,
            'element_type' => 2,
            'task_type' => 3,
            'text' => 'Связаться'
        )
    );
    $amo->create_task($tasks);

}
?>
