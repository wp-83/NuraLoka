<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    protected string $token;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $token)
    {
        $this->token = $token;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $url = route('auth.reset-password.index', [
            'token' => $this->token,
            'email' => $notifiable->email,
        ]);

        $name = $notifiable->userDetails->fullname ?? 'Nuravers';

        return (new MailMessage)
            ->subject('Permintaan Atur Ulang Kata Sandi | NuraLoka')
            ->greeting("Hai, {$name}!")
            ->line('Kami menerima permintaan untuk mengatur ulang kata sandi akun NuraLoka Anda.')
            ->line('Klik tombol di bawah ini untuk membuat kata sandi baru.')
            ->action('Atur Ulang Kata Sandi', $url)
            ->line('Demi keamanan akun, tautan ini hanya berlaku selama **60 menit** dan hanya dapat digunakan satu kali.')
            ->line('Jika Anda tidak merasa melakukan permintaan ini, Anda dapat mengabaikan email ini. Kata sandi Anda tidak akan berubah tanpa tindakan lebih lanjut.')
            ->salutation("Hormat kami,\nTim NuraLoka");
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
